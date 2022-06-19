function tokenizer(document){
    let mecab = require('mecab-ya');
    let tokenized_document = mecab.nounsSync(document);
    return tokenized_document;
}

function build_bag_of_words(tokenized_document){
    let word_to_index = new Map();
    let total_bow = [];
    let total_document = [];
    let bow = [];
    
    // �ϳ��� ������ ����
    for(let index in tokenized_document){
        for(let j in tokenized_document[index]){
            total_document.push(tokenized_document[index][j]);
        }
    }
    console.log('total document : ', total_document);
    
    // �ܾ index ����
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // ó�� �����ϴ� �ܾ� ó��
            word_to_index.set(total_document[word], word_to_index.size);
            total_bow.splice(word_to_index.size - 1, 0, 1);
        }
        else{
            // ������ϴ� �ܾ� ó��
            let index = word_to_index.get(total_document[word]);
            total_bow[index] = total_bow[index] + 1;
        }
    }
    
    for(let index in tokenized_document){
        let bow_temp = [];
        bow_temp.length = word_to_index.size;
        bow_temp.fill(0);
        
        // ���� ������ BOW ���ϱ�(tf ���ϱ�)
        for(let word in bow_temp){
            let i = word_to_index.get(tokenized_document[index][word]);
            bow_temp[i] = bow_temp[i] + 1;
        }
        
        // NaN ����
        bow_temp = bow_temp.filter(function(item){
          return item !== null && item !== undefined && item !== '';
        });
        
        bow.push(bow_temp);
    }
    
    console.log('vocabulary : ', word_to_index);
    console.log('bag of words vectors(term frequency) : ', bow);
    
    return [word_to_index, bow];
}

function get_idf(bow){
    let df = [];
    df.length = bow[0].length;
    df.fill(0);
    
    // df ���ϱ�
    for(let i in df){
        for(let index in bow){
            if(bow[index][i] !== 0){
                df[i] += 1;
            }
        }
    }
    console.log('document frequency : ', df);

    let idf = [];
    let N = bow.length; // ��ü ������ ��
    idf.length = bow[0].length;
    idf.fill(0);
    
    // idf ���ϱ�
    for(let i in idf){
        idf[i] = 1 + Math.log(N / (1 + df[i])); // �ڿ��α�
    }
    console.log('inverse document frequency : ',idf);
    
    return idf;
}

function get_tfidf(bow, idf){
    // tfidf ���ϱ�
    let tfidf = [];
    
    for(let i in bow){
        let tfidf_temp = [];
        tfidf_temp.length = bow[0].length;
        tfidf_temp.fill(0);
        
        for(let j in bow[0]){
            tfidf_temp[j] = bow[i][j] * idf[j];
        }
        
        tfidf.push(tfidf_temp);
    }
    console.log('TF-IDF : ', tfidf);
    
    return tfidf;
}

function cosine_similarity(tfidf){
    //0�� ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    let cos_sim = [];
    let normalized_zero = normalize(tfidf[0]);
    
    for(let i in tfidf){
        let scalar_product = 0;
        for(let j in tfidf[i]){
            // 0�� ���Ϳ� i�� ������ ��Į���
            scalar_product += tfidf[0][j] * tfidf[i][j];
        }
        
        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ���ڰ� 0�̸� �ڻ��� ���絵 = 0
            cos_sim_temp = 0;
        }
        else{
            // ���ڰ� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_zero * normalize(tfidf[i]));
            cos_sim_temp = Number(cos_sim_temp.toFixed(5));
        }
        
        let cos_sim_obj = {
            index: i,
            similarity: cos_sim_temp
        };
        cos_sim.push(cos_sim_obj);
    }

    // ���絵 �������� ����    
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    
    console.log('cosine_similarity : ', cos_sim);
    
    return cos_sim;
}

// DB������ ����� ��
function tokenizer_DB(document){
    let mecab = require('mecab-ya');
    if(document.title){
        //document.title = mecab.posSync(document.title);
        document.title = mecab.nounsSync(document.title);
    }
    return document;
}

function build_bag_of_words_DB(tokenized_document){
    let word_to_index = new Map();
    let total_bow = [];
    let total_document = [];
    let bow = [];
    
    // �ϳ��� ������ ����
    console.time('make total document');
    for(let index in tokenized_document){
        for(let j in tokenized_document[index].title){
            total_document.push(tokenized_document[index].title[j]);
        }
    }
    //console.log('total document : ', total_document);
    console.timeEnd('make total document');
    
    // üũ��
    /*let file = 0;
    for(let i in total_document){
        if(total_document[6] == total_document[i]){
            file += 1;
        }
    }
    console.log('���� : ', file);*/
    
    // �ܾ index ����
    console.time('make vocabulary dictionary');
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // ó�� �����ϴ� �ܾ� ó��
            word_to_index.set(total_document[word], word_to_index.size);
            total_bow.splice(word_to_index.size - 1, 0, 1);
        }
        else{
            // ������ϴ� �ܾ� ó��
            let index = word_to_index.get(total_document[word]);
            total_bow[index] = total_bow[index] + 1;
        }
    }
    //console.log('vocabulary : ', word_to_index);
    console.timeEnd('make vocabulary dictionary');
    
    // ���� ������ BOW ���ϱ�(tf ���ϱ�)
    console.time('make bow');
    for(let index in tokenized_document){
        let bow_obj = {};
        let bow_temp = [];
        
        for(let word in tokenized_document[index].title){
            let i = word_to_index.get(tokenized_document[index].title[word]);
            if(bow_temp.length === 0){
                let pair = {
                    index: i,
                    value: 1
                };
                bow_temp.push(pair);
            }
            
            let flag = 0;
            for(let k in bow_temp){
                if(bow_temp[k].index === i){
                    bow_temp[k].value += 1;
                    flag = 1;
                    break;
                }
            }
            
            if(flag === 0){
                let pair = {
                    index: i,
                    value: 1
                };
                bow_temp.push(pair);
            }
        }
        
        // NaN ����
        //bow_temp = bow_temp.filter(function(item){
        //  return item !== null && item !== undefined && item !== '';
        //});
        
        bow_obj = {
            bid: tokenized_document[index].bid,
            bow: bow_temp
        };
        //if(index%10000 === 0) console.log(index);
        bow.push(bow_obj);
    }
    //console.log('bag of words vectors(term frequency) : ', bow);
    //console.log('0 vector vow : ', bow[0].bow);
    //console.log(bow[0].bow[0]);
    //console.log(bow[0].bow[0].index);
    //console.log(bow[0].bow[0].value);
    console.timeEnd('make bow');
    
    return [word_to_index, bow];
}


function get_idf_DB(bow, vocab){
    let df = [];
    df.length = vocab.size;
    df.fill(0);
    
    // df ���ϱ�
    console.time('make df');
    for(let i in bow){// ���� ������ŭ
        for(let j in bow[i].bow){// ������ bow�� ��ü ������ŭ
            df[bow[i].bow[j].index] += 1;
        }
    }
    //console.log('document frequency : ', df);
    console.timeEnd('make df');

    let idf = [];
    let N = bow.length; // ��ü ������ ��
    idf.length = vocab.size;
    idf.fill(0);
    
    // idf ���ϱ�
    console.time('make idf');
    for(let i in idf){
        idf[i] = 1 + Math.log(N / (1 + df[i])); // �ڿ��α�
    }
    //console.log('inverse document frequency : ',idf);
    console.timeEnd('make idf');
    
    return idf;
}

function get_tfidf_DB(bow, idf){
    // tfidf ���ϱ�
    console.time('make tfidf');
    let tfidf = [];
    let tfidf_obj = {};
    
    for(let i in bow){// ���� ������ŭ
        let tfidf_temp = [];
        
        for(let j in bow[i].bow){
            let t = bow[i].bow[j].value * idf[bow[i].bow[j].index];
            let pair ={
                index: bow[i].bow[j].index,
                value: t
            };
            tfidf_temp.push(pair);
        }
        
        tfidf_obj = {
            bid: bow[i].bid,
            tfidf: tfidf_temp
        };
        
        tfidf.push(tfidf_obj);
    }
    //console.log('TF-IDF : ', tfidf);
    console.timeEnd('make tfidf');
    
    return tfidf;
}

function cosine_similarity_DB(tfidf){
    //0�� ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    console.time('cosine similarity test');
    let cos_sim = [];
    let normalized_zero = normalize_DB(tfidf[0].tfidf);
    
    for(let i in tfidf){// ��ü ������ ����
        let scalar_product = 0;
        for(let j in tfidf[0].tfidf){// 0�� ������ tfidf ������ŭ
            for(let k in tfidf[i].tfidf){// i�� ������ tfidf ������ŭ
                // 0�� ���Ϳ� i�� ������ ��Į���
                if(tfidf[0].tfidf[j].index === tfidf[i].tfidf[k].index){
                    scalar_product += tfidf[0].tfidf[j].value * tfidf[i].tfidf[k].value;
                }
            }
        }
        
        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ���ڰ� 0�̸� �ڻ��� ���絵 = 0
            cos_sim_temp = 0;
        }
        else{
            // ���ڰ� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_zero * normalize_DB(tfidf[i].tfidf));
            cos_sim_temp = Number(cos_sim_temp.toFixed(5));
        }
        
        
        
        let cos_sim_obj = {
            bid: tfidf[i].bid,
            similarity: cos_sim_temp
        };
        cos_sim.push(cos_sim_obj);
    }

    // ���絵 �������� ����    
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    
    // ���� 5���� bid�� ����
    let top5_cos_sim_bid = [];
    //console.log('cosine_similarity : ', cos_sim[0]);
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_bid.push(cos_sim[i].bid);
    }
    //console.log('cosine_similarity : ', cos_sim);
    
    console.timeEnd('cosine similarity test');
    return top5_cos_sim_bid;
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


function normalize(vector){
    // ���� ����ȭ ����
    let sum_square = 0;
    for(let i in vector){
        sum_square += vector[i] * vector[i];
    }
    
    return Math.sqrt(sum_square);
}

function normalize_DB(vector){
    // ���� ����ȭ ����
    let sum_square = 0;
    for(let i in vector){
        sum_square += vector[i].value * vector[i].value;
    }
    
    return Math.sqrt(sum_square);
}


module.exports = {
    tokenizer,
    tokenizer_DB,
    build_bag_of_words,
    build_bag_of_words_DB,
    get_idf,
    get_idf_DB,
    get_tfidf,
    get_tfidf_DB,
    cosine_similarity,
    cosine_similarity_DB,
    save_document_file,
    load_document_file,
};