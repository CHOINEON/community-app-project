function tokenizer(document){
    const mecab = require('mecab-ya');
    const stopword = require('./stopword');
    
    let tokenized_document = [];
    for(let i in document){
        let tokens = mecab.nounsSync(document[i]);
        tokens = stopword.remove_stopwords(tokens);
        for(let i in tokens){
            tokens[i] = tokens[i].toLowerCase();
        };
        tokenized_document.push(tokens);
    }
    return tokenized_document;
}

function build_bag_of_words(bid, tokenized_document){
    let word_to_index = new Map();
    let total_document = [];
    let bow = {};
    let row = [];
    let col = [];
    let data = [];
    let N = tokenized_document.length;
    
    // �ϳ��� ������ ����
    for(let index in tokenized_document){
        for(let j in tokenized_document[index]){
            total_document.push(tokenized_document[index][j]);
        }
    }
    //console.log('total document : ', total_document);
    
    // �ܾ index ����
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // ó�� �����ϴ� �ܾ� ó��
            word_to_index.set(total_document[word], word_to_index.size);
        }
    }
    
    // csr�������� bow �����
    row.push(0);

    for(let index in tokenized_document){
        col_temp = [];
        data_temp = [];
        let bow_temp = [];
        let bow_obj = {};
        for(let word in tokenized_document[index]){
            let i = word_to_index.get(tokenized_document[index][word]);

            if(bow_temp.length === 0){
                /*col_temp.push(i);
                data_temp.push(1);*/
                
                // ���������� ���� ��ü
                bow_obj = {
                    'col':i,
                    'data':1,
                }
                bow_temp.push(bow_obj);
            }
            else{
                let flag = 0;
                /*for(let k in col_temp){
                    if(col_temp[k] === i){
                        data_temp[k]++;
                        flag = 1;
                        break;
                    }
                }
                if(flag === 0){
                    col_temp.push(i);
                    data_temp.push(1);
                }*/
                
                for(let k in bow_temp){
                    if(bow_temp[k].col === i){
                        bow_temp[k].data++;
                        flag = 1;
                        break;
                    }
                }
                if(flag === 0){
                    bow_obj = {
                        'col':i,
                        'data':1,
                    }
                    bow_temp.push(bow_obj);
                }
            }
        }
        /*row.push(col_temp.length + row[index]);
        for(let i in col_temp){
            col.push(col_temp[i]);
            data.push(data_temp[i]);
        }*/
        
        row.push(bow_temp.length + row[index]);
        bow_temp.sort(function(a, b) {
            return a.col - b.col;
        });
        for(let i in bow_temp){
            col.push(bow_temp[i].col);
            data.push(bow_temp[i].data);
        }
    }

    bow = {
        'numberOfDocuments':N,
        'row':row,
        'col':col,
        'data':data,
        'bid':bid,
    }
    
    //console.log('vocabulary : ', word_to_index);
    //console.log('bag of words vectors(term frequency) : ', bow);
    
    return [word_to_index, bow];
}

function get_idf(bow, vocab){
    let df = [];
    df.length = vocab.size;
    df.fill(0);
    
    // df ���ϱ�
    for(let i in bow.col){// �����ϴ� column�� ������ index�� ���� 1�� ������Ŵ
        df[bow.col[i]]++;
    }
    //console.log('document frequency : ', df);

    let idf = [];
    let N = bow['numberOfDocuments']; // ��ü ������ ��
    idf.length = vocab.size;
    idf.fill(0);
    
    // idf ���ϱ�
    for(let i in idf){
        idf[i] = 1 + Math.log((1 + N) / (1 + df[i])); // �ڿ��α�
    }
    //console.log('inverse document frequency : ',idf);
    
    return idf;
}

function get_tfidf(bow, idf){
    // tfidf ���ϱ�
    let tfidf = {};
    let data_temp = [];
    
    for(let i in bow.data){// data ������ŭ
        data_temp.push(bow.data[i] * idf[bow.col[i]]);
    }

    tfidf = {
        'numberOfDocuments':bow.numberOfDocuments,
        'row':bow.row,
        'col':bow.col,
        'data':data_temp,
        'bid':bow.bid,
    }
    
    //console.log('TF-IDF : ', tfidf);
    
    return tfidf;
}

function cosine_similarity(tfidf){
    //0�� ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    let cos_sim = [];
    let zero_row = tfidf.row[1] - tfidf.row[0];
    let zero_col = [];
    let zero_data = [];
    for(let i=0;i<zero_row;i++){// 0�� ������ colmun�� data�� ����
        zero_col.push(tfidf.col[i]);
        zero_data.push(tfidf.data[i]);
    }

    let normalized_zero = normalize(zero_data);
    console.time('cal');
    for(let i=0;i<tfidf.numberOfDocuments;i++){// ��ü ������ ����
        let scalar_product = 0;
        let comp_row = tfidf.row[i+1];
        let comp_col = [];
        let comp_data = [];
        for(let j=tfidf.row[i];j<comp_row;j++){// i�� ������ colmun�� data�� ����
            comp_col.push(tfidf.col[j]);
            comp_data.push(tfidf.data[j]);
        }

        // ��Į��� ���ϱ�
        for(let j in zero_data){// 0�� ������ tfidf ������ŭ
            for(let k in comp_data){// i�� ������ tfidf ������ŭ

                // 0�� ������ tfidf���Ϳ� i�� ������ tfidf������ ��Į���
                if(zero_col[j] === comp_col[k]){
                    scalar_product += zero_data[j] * comp_data[k];
                    break;
                }
            }
        }

        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ��Į����� 0�̸� �ڻ��� ���絵�� 0
            cos_sim_temp = 0;
        }
        else{
            // ��Į����� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_zero * normalize(comp_data));
            cos_sim_temp = Number(cos_sim_temp.toFixed(4));
        }

        let cos_sim_obj = {
            'id':i,
            'similarity':cos_sim_temp,
        }
        cos_sim.push(cos_sim_obj);
    }
    console.timeEnd('cal');
    // ���絵 �������� ����    
    console.time('sort');
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    console.timeEnd('sort');

    // ���� 5���� bid�� ����
    let top5_cos_sim_id = [];
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_id.push(cos_sim[i].id);
    }
    
    return top5_cos_sim_id;
}

function cosine_similarity_lastnum(tfidf){
    // ������ ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    let cos_sim = [];
    let N = tfidf.numberOfDocuments;
    let last_row = tfidf.row[N] - tfidf.row[N-1];
    let last_col = [];
    let last_data = [];
    let last_col_start_index = tfidf.col.length - last_row;
    for(let i=last_col_start_index;i<tfidf.col.length;i++){// ������ ������ colmun�� data�� ����
        last_col.push(tfidf.col[i]);
        last_data.push(tfidf.data[i]);
    }
    //console.log(last_col);
    //console.log(last_data);
    //console.log(tfidf);

    let normalized_last = normalize(last_data);
    console.time('cal');
    for(let i=0;i<tfidf.numberOfDocuments;i++){// ��ü ������ ����
        let scalar_product = 0;
        let comp_row = tfidf.row[i+1];
        let comp_col = [];
        let comp_data = [];
        for(let j=tfidf.row[i];j<comp_row;j++){// i�� ������ colmun�� data�� ����
            comp_col.push(tfidf.col[j]);
            comp_data.push(tfidf.data[j]);
        }

        // ��Į��� ���ϱ�
        /*for(let j in last_data){// ������ ������ tfidf ������ŭ
            for(let k in comp_data){// i�� ������ tfidf ������ŭ

                // ������ ������ tfidf���Ϳ� i�� ������ tfidf������ ��Į���
                if(last_col[j] === comp_col[k]){
                    scalar_product += last_data[j] * comp_data[k];
                    break;
                }
            }
        }*/
        
        // ��Į��� ���ϱ� ��������
        let last_pointer = 0;
        let comp_pointer = 0;
        let last_end = last_data.length - 1;
        let comp_end = comp_data.length - 1;
        while(1){
            if(last_pointer>last_end || comp_pointer>comp_end){
                break;
            }
            
            if(last_col[last_pointer] === comp_col[comp_pointer]){
                scalar_product += last_data[last_pointer] * comp_data[comp_pointer];
                last_pointer++;
                comp_pointer++;
            }
            else if(last_col[last_pointer] < comp_col[comp_pointer]){
                last_pointer++;
            }
            else if(comp_col[comp_pointer] < last_col[last_pointer]){
                comp_pointer++;
            }
        }

        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ��Į����� 0�̸� �ڻ��� ���絵�� 0
            continue;
            //cos_sim_temp = 0;
        }
        else{
            // ��Į����� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_last * normalize(comp_data));
            cos_sim_temp = Number(cos_sim_temp.toFixed(4));
        }

        if(cos_sim_temp > 0.1){ // ���絵�� 0.1���ϸ� �Ѿ
            let cos_sim_obj = {
                'id':i,
                'similarity':cos_sim_temp,
            }
            cos_sim.push(cos_sim_obj);
        }
    }
    // ������ ������ ���� ���
    if(cos_sim.length === 0){
        console.log('no similar post');
        return;
    }
    console.timeEnd('cal');
    // ���絵 �������� ����    
    console.time('sort');
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    console.timeEnd('sort');
    //console.log(cos_sim);

    // ���� 5���� bid�� ����
    let top5_cos_sim_id = [];
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_id.push(cos_sim[i].id);
    }
    
    return top5_cos_sim_id;
}

function similarity_test(document){
    console.time('time');
    // ���� ��ūȭ
    let tokenized_document = tokenizer(document);
    //console.log('tokenized_document : ', tokenized_document);
    
    // ��� �ܾ index ����
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // ��� �ܾ��� idf ���ϱ�
    let idf = get_idf(bow, vocab);
    
    // ��� ������ tfidf ���ϱ�
    let tfidf = get_tfidf(bow, idf);
    
    // 0�� ������ ������ ������ ���絵 �˻�
    let cos_sim = cosine_similarity(tfidf);
    
    // ������ 5�� ���� ���
    for(let i in cos_sim){
        console.log('id : ', cos_sim[i], ', ', document[cos_sim[i]]);
    }
    
    console.timeEnd('time');
}

function similarity_test_token(tokenized_document){
    console.time('time');
    // ��� �ܾ index ����
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // ��� �ܾ��� idf ���ϱ�
    let idf = get_idf(bow, vocab);
    
    // ��� ������ tfidf ���ϱ�
    let tfidf = get_tfidf(bow, idf);
    
    // 0�� ������ ������ ������ ���絵 �˻�
    let cos_sim = cosine_similarity(tfidf);
    console.timeEnd('time');
}

function normalize(vector){
    // ���� ����ȭ ����
    let sum_square = 0;
    for(let i in vector){
        sum_square += vector[i] * vector[i];
    }
    
    return Math.sqrt(sum_square);
}

function save_document_file(path, document){
    const fs = require('fs');
    fs.writeFile(path, JSON.stringify(document), err => {
        if(err){
            console.error(err);
            return;
        }
        else{
            console.log('document saved in : ', path);
        }
    });
}

function load_document_file(path){
    const fs = require('fs');
    let readData = fs.readFileSync(path);
    return JSON.parse(readData.toString());
}

function tokenize_DBdata(path, flag){
    let DBdata = load_document_file(path);
    let bid = [];
    let title = [];
    
    if(flag === 'title'){
      for(let i in DBdata){
          bid.push(DBdata[i].bid);
          title.push(DBdata[i].title);
      }
    }
    else if(flag === 'content'){
        for(let i in DBdata){
          bid.push(DBdata[i].bid);
          title.push(DBdata[i].title + DBdata[i].content);
      }
    }
    else{
        console.log('wrong flag');
        return;
    }

    let tokenized_title = tokenizer(title);

    return [bid, tokenized_title];
}

module.exports = {
    tokenizer,
    build_bag_of_words,
    get_idf,
    get_tfidf,
    cosine_similarity,
    cosine_similarity_lastnum,
    similarity_test,
    similarity_test_token,
    save_document_file,
    load_document_file,
    tokenize_DBdata,
};