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
    
    // 하나의 문서로 통합
    for(let index in tokenized_document){
        for(let j in tokenized_document[index]){
            total_document.push(tokenized_document[index][j]);
        }
    }
    //console.log('total document : ', total_document);
    
    // 단어에 index 맵핑
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // 처음 등장하는 단어 처리
            word_to_index.set(total_document[word], word_to_index.size);
        }
    }
    
    // csr형식으로 bow 만들기
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
                
                // 오름차순을 위한 객체
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
    
    // df 구하기
    for(let i in bow.col){// 등장하는 column과 동일한 index의 값을 1씩 증가시킴
        df[bow.col[i]]++;
    }
    //console.log('document frequency : ', df);

    let idf = [];
    let N = bow['numberOfDocuments']; // 전체 문서의 수
    idf.length = vocab.size;
    idf.fill(0);
    
    // idf 구하기
    for(let i in idf){
        idf[i] = 1 + Math.log((1 + N) / (1 + df[i])); // 자연로그
    }
    //console.log('inverse document frequency : ',idf);
    
    return idf;
}

function get_tfidf(bow, idf){
    // tfidf 구하기
    let tfidf = {};
    let data_temp = [];
    
    for(let i in bow.data){// data 개수만큼
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
    //0번 문서와 다른 모든 문서를 비교해서 코사인 유사도를 구함
    let cos_sim = [];
    let zero_row = tfidf.row[1] - tfidf.row[0];
    let zero_col = [];
    let zero_data = [];
    for(let i=0;i<zero_row;i++){// 0번 문서의 colmun과 data를 추출
        zero_col.push(tfidf.col[i]);
        zero_data.push(tfidf.data[i]);
    }

    let normalized_zero = normalize(zero_data);
    console.time('cal');
    for(let i=0;i<tfidf.numberOfDocuments;i++){// 전체 문서에 대해
        let scalar_product = 0;
        let comp_row = tfidf.row[i+1];
        let comp_col = [];
        let comp_data = [];
        for(let j=tfidf.row[i];j<comp_row;j++){// i번 문서의 colmun과 data를 추출
            comp_col.push(tfidf.col[j]);
            comp_data.push(tfidf.data[j]);
        }

        // 스칼라곱 구하기
        for(let j in zero_data){// 0번 문서의 tfidf 개수만큼
            for(let k in comp_data){// i번 문서의 tfidf 개수만큼

                // 0번 문서의 tfidf벡터와 i번 문서의 tfidf벡터의 스칼라곱
                if(zero_col[j] === comp_col[k]){
                    scalar_product += zero_data[j] * comp_data[k];
                    break;
                }
            }
        }

        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // 스칼라곱이 0이면 코사인 유사도는 0
            cos_sim_temp = 0;
        }
        else{
            // 스칼라곱이 0이 아니면 코사인 유사도 공식 사용
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
    // 유사도 내림차순 정렬    
    console.time('sort');
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    console.timeEnd('sort');

    // 상위 5개의 bid만 추출
    let top5_cos_sim_id = [];
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_id.push(cos_sim[i].id);
    }
    
    return top5_cos_sim_id;
}

function cosine_similarity_lastnum(tfidf){
    // 마지막 문서와 다른 모든 문서를 비교해서 코사인 유사도를 구함
    let cos_sim = [];
    let N = tfidf.numberOfDocuments;
    let last_row = tfidf.row[N] - tfidf.row[N-1];
    let last_col = [];
    let last_data = [];
    let last_col_start_index = tfidf.col.length - last_row;
    for(let i=last_col_start_index;i<tfidf.col.length;i++){// 마지막 문서의 colmun과 data를 추출
        last_col.push(tfidf.col[i]);
        last_data.push(tfidf.data[i]);
    }
    //console.log(last_col);
    //console.log(last_data);
    //console.log(tfidf);

    let normalized_last = normalize(last_data);
    console.time('cal');
    for(let i=0;i<tfidf.numberOfDocuments;i++){// 전체 문서에 대해
        let scalar_product = 0;
        let comp_row = tfidf.row[i+1];
        let comp_col = [];
        let comp_data = [];
        for(let j=tfidf.row[i];j<comp_row;j++){// i번 문서의 colmun과 data를 추출
            comp_col.push(tfidf.col[j]);
            comp_data.push(tfidf.data[j]);
        }

        // 스칼라곱 구하기
        /*for(let j in last_data){// 마지막 문서의 tfidf 개수만큼
            for(let k in comp_data){// i번 문서의 tfidf 개수만큼

                // 마지막 문서의 tfidf벡터와 i번 문서의 tfidf벡터의 스칼라곱
                if(last_col[j] === comp_col[k]){
                    scalar_product += last_data[j] * comp_data[k];
                    break;
                }
            }
        }*/
        
        // 스칼라곱 구하기 투포인터
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
            // 스칼라곱이 0이면 코사인 유사도는 0
            continue;
            //cos_sim_temp = 0;
        }
        else{
            // 스칼라곱이 0이 아니면 코사인 유사도 공식 사용
            cos_sim_temp = scalar_product / (normalized_last * normalize(comp_data));
            cos_sim_temp = Number(cos_sim_temp.toFixed(4));
        }

        if(cos_sim_temp > 0.1){ // 유사도가 0.1이하면 넘어감
            let cos_sim_obj = {
                'id':i,
                'similarity':cos_sim_temp,
            }
            cos_sim.push(cos_sim_obj);
        }
    }
    // 유사한 문서가 없을 경우
    if(cos_sim.length === 0){
        console.log('no similar post');
        return;
    }
    console.timeEnd('cal');
    // 유사도 내림차순 정렬    
    console.time('sort');
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    console.timeEnd('sort');
    //console.log(cos_sim);

    // 상위 5개의 bid만 추출
    let top5_cos_sim_id = [];
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_id.push(cos_sim[i].id);
    }
    
    return top5_cos_sim_id;
}

function similarity_test(document){
    console.time('time');
    // 문서 토큰화
    let tokenized_document = tokenizer(document);
    //console.log('tokenized_document : ', tokenized_document);
    
    // 모든 단어에 index 맵핑
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // 모든 단어의 idf 구하기
    let idf = get_idf(bow, vocab);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = get_tfidf(bow, idf);
    
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = cosine_similarity(tfidf);
    
    // 유사한 5개 문서 출력
    for(let i in cos_sim){
        console.log('id : ', cos_sim[i], ', ', document[cos_sim[i]]);
    }
    
    console.timeEnd('time');
}

function similarity_test_token(tokenized_document){
    console.time('time');
    // 모든 단어에 index 맵핑
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // 모든 단어의 idf 구하기
    let idf = get_idf(bow, vocab);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = get_tfidf(bow, idf);
    
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = cosine_similarity(tfidf);
    console.timeEnd('time');
}

function normalize(vector){
    // 벡터 정규화 공식
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

function tokenize_DBdata(path){
    let DBdata = load_document_file(path);
    let bid = [];
    let title = [];

    for(let i in DBdata){
        bid.push(DBdata[i].bid);
        title.push(DBdata[i].title);
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