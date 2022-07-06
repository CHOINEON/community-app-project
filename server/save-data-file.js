const simpleTfidfDB = require('./simple-tf-idf-db');
console.log('HI');

let data_num = '100k';
let server_tfidf = simpleTfidfDB.load_document_file('./data/' + data_num +'_tfidf_DBdata');

function save_token_DBdata(){
    console.log('data_num : ', data_num);
    console.time('runtime');
    let path = './data/' + data_num +'_DBdata';
    let result = simpleTfidfDB.tokenize_DBdata(path);
    let bid = result[0];
    let title = result[1];
    
    path = './data/' + data_num +'_token_DBdata';
    simpleTfidfDB.save_document_file(path, result);
    console.timeEnd('runtime');
}

function save_tfidf_DBdata(){
    console.time('runtime');
    let document = [];
    
    // 미리 토큰화된 DBdata 가져오기
    let path = './data/' + data_num +'_token_DBdata';
    let token_DBdata = simpleTfidfDB.load_document_file(path);
    let bid = token_DBdata[0];
    let token_title = token_DBdata[1];
    
    // 모든 단어에 index 매핑
    let bow_result = simpleTfidfDB.build_bag_of_words(bid, token_title);
    let vocab = bow_result[0];
    let bow = bow_result[1];
    let vocab_obj = [];
    for(const [key, value] of vocab){
        let temp_obj ={
            key: key,
            value: value
        };
        vocab_obj.push(temp_obj);
    }
    path = './data/' + data_num +'_vocab_DBdata';
    simpleTfidfDB.save_document_file(path, vocab_obj);
    
    // 모든 단어의 idf 구하기
    let idf = simpleTfidfDB.get_idf(bow, vocab);
    path = './data/' + data_num +'_idf_DBdata';
    simpleTfidfDB.save_document_file(path, idf);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = simpleTfidfDB.get_tfidf(bow, idf);
    path = './data/' + data_num +'_tfidf_DBdata';
    simpleTfidfDB.save_document_file(path, tfidf);
    console.timeEnd('runtime');
}

function NLP_token_file(){
    // 미리 토큰화된 파일과 사용자의 질문 비교
    
    console.time('runtime');
    let document = [];
    
    // 미리 토큰화된 DBdata 가져오기
    let path = './data/' + data_num +'_token_DBdata';
    let token_DBdata = simpleTfidfDB.load_document_file(path);
    let bid = token_DBdata[0];
    let token_title = token_DBdata[1];
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    let temp = [];
    temp.push(UserQ.title);
    
    // 유저의 질문과 토큰화된 문서 합치기
    let tokenized_UserQ = simpleTfidfDB.tokenizer(temp);
    bid.unshift(UserQ.bid);
    token_title.unshift(tokenized_UserQ[0]);

    // 모든 단어에 index 매핑
    let result = simpleTfidfDB.build_bag_of_words(bid, token_title);
    let vocab = result[0];
    let bow = result[1];
    
    // 모든 단어의 idf 구하기
    let idf = simpleTfidfDB.get_idf(bow, vocab);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = simpleTfidfDB.get_tfidf(bow, idf);
     
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = simpleTfidfDB.cosine_similarity(tfidf);
    
    let top5bid = [];
    for(let i=0;i<5;i++){
        top5bid.push(bid[cos_sim[i]]);
    }
    console.log(cos_sim);
    console.log(top5bid);
    console.timeEnd('runtime');
}

function NLP_tfidf_file(){
    // 미리 계산된 tfidf 파일과 사용자의 질문 비교
    
    console.time('runtime');
    let document = [];
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    let temp = [];
    temp.push(UserQ.title);
    
    // 유저 질문 토큰화
    let tokenized_UserQ = simpleTfidfDB.tokenizer(temp);
    tokenized_UserQ = tokenized_UserQ[0];
    console.log(tokenized_UserQ);
    
    console.time('read file time');
    // 미리 저장된 단어 사전 불러오기
    let path = './data/' + data_num +'_vocab_DBdata';
    let vocab_file = simpleTfidfDB.load_document_file(path);
    let vocab = new Map();
    for(let i in vocab_file){
        vocab.set(vocab_file[i].key, vocab_file[i].value);
    }
    //console.log(vocab);
    
    // 미리 저장된 idf 불러오기
    path = './data/' + data_num +'_idf_DBdata';
    let idf = simpleTfidfDB.load_document_file(path);
    //console.log(idf);
    
    // 미리 저장된 tfidf 불러오기
    console.time('read tfidf time');
    path = './data/' + data_num +'_tfidf_DBdata';
    //let tfidf = simpleTfidfDB.load_document_file(path);
    let tfidf = server_tfidf;
    //console.log(tfidf);
    console.timeEnd('read tfidf time');
    console.timeEnd('read file time');
    
    // 유저 질문 tf 구하기
    row_temp = 0;
    col_temp = [];
    data_temp = [];
    let bow_temp = [];
    let bow_obj = {};
    for(let word in tokenized_UserQ){
        let i = vocab.get(tokenized_UserQ[word]);
        //console.log(tokenized_UserQ[word],' : ',i);
        
        if(i == null){
            continue;
        }

        if(col_temp.length === 0){
            /*col_temp.push(i);
            data_temp.push(1);*/

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
    bow_temp.sort(function(a, b) {
        return a.col - b.col;
    });
    for(let i in bow_temp){
        col_temp.push(bow_temp[i].col);
        data_temp.push(bow_temp[i].data);
    }
    row_temp = col_temp.length;
    
    // 유저 질문 tfidf 구하기
    for(let i in col_temp){
        data_temp[i] = data_temp[i] * idf[col_temp[i]];
    }
    //console.log(row_temp);
    //console.log(col_temp);
    //console.log(data_temp);
    //console.log(tfidf);
    
    // 유저 질문 tfidf를 미리 저장된 tfidf와 합침
    console.time('assemble');
    /*// 0번 문서와 다른 문서를 비교
    for(let i in tfidf.row){
        tfidf.row[i] +=row_temp;
    }
    tfidf.row.unshift(0);
    tfidf.bid.unshift(0);
    
    for(let i in col_temp){
        tfidf.col.unshift(col_temp[col_temp.length - 1 - i]);
        tfidf.data.unshift(data_temp[col_temp.length - 1 - i]);
    }
    */
    // 마지막 문서와 다른 문서를 비교
    let N = tfidf.numberOfDocuments;
    tfidf.numberOfDocuments++;
    tfidf.row.push(tfidf.row[N] + row_temp);
    tfidf.bid.push(0);
    for(let i in col_temp){
        tfidf.col.push(col_temp[i]);
        tfidf.data.push(data_temp[i]);
    }
    
    //console.log(row_temp);
    //console.log(col_temp);
    //console.log(data_temp);
    //console.log(tfidf);
    console.timeEnd('assemble');
    
    // 유저 질문 tfidf와 미리 저장된 tfidf값을 코사인 유사도 검사함
    console.time('user cos_sim time');
    let cos_sim = simpleTfidfDB.cosine_similarity_lastnum(tfidf);
    let top5bid = [];
    for(let i=0;i<5;i++){
        top5bid.push(tfidf.bid[cos_sim[i]]);
    }
    console.log(cos_sim);
    console.log(top5bid);
    console.timeEnd('user cos_sim time');
    
    // tfidf에서 마지막 문서를 제거
    tfidf.numberOfDocuments--;
    tfidf.row.pop();
    tfidf.bid.pop();
    for(let i in col_temp){
        tfidf.col.pop();
        tfidf.data.pop();
    }
    
    console.timeEnd('runtime');
}

module.exports = {
    save_token_DBdata,
    save_tfidf_DBdata,
    NLP_token_file,
    NLP_tfidf_file,
};