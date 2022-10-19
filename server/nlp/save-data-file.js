const simpleTfidfDB = require('./simple-tf-idf-db');
const db = require('../dbconnection');
console.log('HI');

let data_num = '50k';
let server_tfidf = simpleTfidfDB.load_document_file('./data/' + data_num +'_tfidf_DBdata');
console.log('load ' + data_num +'_tfidf_DBdata file to memory');

function csv_to_DB(path){
    console.log('csv to DB');
    const fs = require('fs');
    const csv = require('csv-parser');
    const dataArray = [];
    
    fs.createReadStream(path)
        .pipe(csv({delimiter: ','}))
        .on("data", (row) => {
            dataArray.push(row);
        })
        .on("end", () => {
        
        //console.log(dataArray);
        
        /*
        // �ߺ� ����
        for(var i in dataArray){
          const iTitle = dataArray[i]["title"];
          for(var j = 0;j < i;j++){
            const jTitle = dataArray[j]["title"];
            if(iTitle === jTitle){
              dataArray.splice(j, 1);
            }
          }
        }
        */
        
        // db�� �ű��
        let contentMax = 0;
        let titleMax = 0;
        for(var i in dataArray){
           const title = dataArray[i]["title"];
           const content = dataArray[i]["content"];
           // max size üũ
           if(contentMax<content.length){
             contentMax = content.length;
           }
           if(titleMax<title.length){
             titleMax = title.length;
           }
           
           /*
           db.query('insert into board2 (title, content)values (?,?)', [title, content], (err, rows)=>{
             if(!err){
             }
             else{
               console.log(err);
             }
           });*/
        }
        console.log(titleMax);
        console.log(contentMax);
    });
}

function save_DBdata_file(){
    let DBdata = [];
    db.query('select bid, title, content from board2', (err, rows) =>{
        DBdata = rows.map(v => Object.assign({}, v));
        
        let document = [];
        
        for(let i=0;i<10;i++){
            document.push(DBdata[i]);
        }
        /*
        for(let i=0;i<9;i++){
            for(let k=0;k<10000;k++){
                document.push(DBdata[k]);
            }
        }
        */
        
        let path = './data/' + data_num +'_DBdata';
        simpleTfidfDB.save_document_file(path, document);
        console.log('document number: ', document.length);
    });
}

function save_token_DBdata(){
    console.log('data_num : ', data_num);
    console.time('runtime');
    let path = './data/' + data_num +'_DBdata';
    let flag = 'content';
    let result = simpleTfidfDB.tokenize_DBdata(path, flag);
    let bid = result[0];
    let title = result[1];
    
    path = './data/' + data_num +'_token_DBdata';
    simpleTfidfDB.save_document_file(path, result);
    console.timeEnd('runtime');
}

function make_big_DBdata(){
    let path = './data/10k_token_DBdata';
    let result = simpleTfidfDB.load_document_file(path);
    for(let i=0;i<99;i++){
        for(let j=0;j<10000;j++){
            result[0].push(result[0][j]);
            result[1].push(result[1][j]);
        }
    }
    
    path = './data/1m_token_DBdata';
    simpleTfidfDB.save_document_file(path, result);
}

function save_tfidf_DBdata(){
    console.time('runtime');
    let document = [];
    
    // �̸� ��ūȭ�� DBdata ��������
    let path = './data/' + data_num +'_token_DBdata';
    let token_DBdata = simpleTfidfDB.load_document_file(path);
    let bid = token_DBdata[0];
    let token_title = token_DBdata[1];
    
    // ��� �ܾ index ����
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
    
    // ��� �ܾ��� idf ���ϱ�
    let idf = simpleTfidfDB.get_idf(bow, vocab);
    path = './data/' + data_num +'_idf_DBdata';
    simpleTfidfDB.save_document_file(path, idf);
    
    // ��� ������ tfidf ���ϱ�
    let tfidf = simpleTfidfDB.get_tfidf(bow, idf);
    path = './data/' + data_num +'_tfidf_DBdata';
    simpleTfidfDB.save_document_file(path, tfidf);
    console.timeEnd('runtime');
}

function NLP_token_file(){
    // �̸� ��ūȭ�� ���ϰ� ������� ���� ��
    
    console.time('runtime');
    let document = [];
    
    // �̸� ��ūȭ�� DBdata ��������
    let path = './data/' + data_num +'_token_DBdata';
    let token_DBdata = simpleTfidfDB.load_document_file(path);
    let bid = token_DBdata[0];
    let token_title = token_DBdata[1];
    
    let UserQ = {
        bid: 0,
        title: '���̽����� ũ�Ѹ��ϴ� ��� �����̿�',
    };
    
    let temp = [];
    temp.push(UserQ.title);
    
    // ������ ������ ��ūȭ�� ���� ��ġ��
    let tokenized_UserQ = simpleTfidfDB.tokenizer(temp);
    bid.unshift(UserQ.bid);
    token_title.unshift(tokenized_UserQ[0]);

    // ��� �ܾ index ����
    let result = simpleTfidfDB.build_bag_of_words(bid, token_title);
    let vocab = result[0];
    let bow = result[1];
    
    // ��� �ܾ��� idf ���ϱ�
    let idf = simpleTfidfDB.get_idf(bow, vocab);
    
    // ��� ������ tfidf ���ϱ�
    let tfidf = simpleTfidfDB.get_tfidf(bow, idf);
     
    // 0�� ������ ������ ������ ���絵 �˻�
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
    // �̸� ���� tfidf ���ϰ� ������� ���� ��
    
    console.time('runtime');
    let document = [];
    
    let UserQ = {
        bid: 0,
        //title: '���̽����� ũ�Ѹ��ϴ� ��� �����̿�',
        title: 'natural language processing in Javascript',
    };
    
    let temp = [];
    temp.push(UserQ.title);
    
    // ���� ���� ��ūȭ
    let tokenized_UserQ = simpleTfidfDB.tokenizer(temp);
    tokenized_UserQ = tokenized_UserQ[0];
    console.log(tokenized_UserQ);
    
    console.time('read file time');
    // �̸� ����� �ܾ� ���� �ҷ�����
    console.time('read vocab time');
    let path = './data/' + data_num +'_vocab_DBdata';
    let vocab_file = simpleTfidfDB.load_document_file(path);
    let vocab = new Map();
    for(let i in vocab_file){
        vocab.set(vocab_file[i].key, vocab_file[i].value);
    }
    //console.log(vocab);
    console.timeEnd('read vocab time');
    
    // �̸� ����� idf �ҷ�����
    console.time('read idf time');
    path = './data/' + data_num +'_idf_DBdata';
    let idf = simpleTfidfDB.load_document_file(path);
    //console.log(idf);
    console.timeEnd('read idf time');
    
    // �̸� ����� tfidf �ҷ�����
    console.time('read tfidf time');
    path = './data/' + data_num +'_tfidf_DBdata';
    //let tfidf = simpleTfidfDB.load_document_file(path);
    let tfidf = server_tfidf;
    //console.log(tfidf);
    console.timeEnd('read tfidf time');
    console.timeEnd('read file time');
    
    // ���� ���� tf ���ϱ�
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
    
    // ���� ������ ������ ������ ���� ���(�ܾ������ ������ ���� ��ū�� ���� ���)
    if(bow_temp.length === 0){
        console.log('no similar post');
        return;
    }
    
    bow_temp.sort(function(a, b) {
        return a.col - b.col;
    });
    for(let i in bow_temp){
        col_temp.push(bow_temp[i].col);
        data_temp.push(bow_temp[i].data);
    }
    row_temp = col_temp.length;
    
    // ���� ���� tfidf ���ϱ�
    for(let i in col_temp){
        data_temp[i] = data_temp[i] * idf[col_temp[i]];
    }
    //console.log(row_temp);
    //console.log(col_temp);
    //console.log(data_temp);
    //console.log(tfidf);
    
    // ���� ���� tfidf�� �̸� ����� tfidf�� ��ħ
    console.time('assemble');
    /*// ���� ����tfidf�� 0���� �־ ��ħ
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
    // ���� ���� tfidf�� ������ ��ȣ�� �־ ��ħ
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
    
    // ���� ���� tfidf�� �̸� ����� tfidf���� �ڻ��� ���絵 �˻���
    console.time('user cos_sim time');
    let cos_sim = simpleTfidfDB.cosine_similarity_lastnum(tfidf);
    let top5bid = [];
    for(let i=0;i<5;i++){
        top5bid.push(tfidf.bid[cos_sim[i]]);
    }
    console.log(cos_sim);
    console.log(top5bid);
    console.timeEnd('user cos_sim time');
    
    // tfidf���� ������ ������ ����
    tfidf.numberOfDocuments--;
    tfidf.row.pop();
    tfidf.bid.pop();
    for(let i in col_temp){
        tfidf.col.pop();
        tfidf.data.pop();
    }
    
    console.timeEnd('runtime');
}

async function save_invertedIndex_file(){
    let tokenized = [];
    // ���� DB �����͸� ������
    function asyncFetch(){
        return new Promise((resolve, rejects) => {
            //console.log(1);
            let qry = 'select bid, title, content from board2 order by bid DESC Limit 3';
            db.query(qry , (err, rows) => {
                if(err) return rejects(err);
                DBdata = rows.map(v => Object.assign({}, v));
                let cur_bid = DBdata[0].bid;
                let zero = {
                    bid: 0,
                    title: '',
                    content: '',
                }
                DBdata.unshift(zero);
                let document = [];
                for(i in DBdata){
                    document.push(DBdata[i]);
                }
                //console.log(document);
                let path = './data/cur_DB';
                simpleTfidfDB.save_document_file(path, document);
                path = './data/cur_bid';
                simpleTfidfDB.save_document_file(path, cur_bid);
                return resolve();
            })
        })
    }
    // ��ūȭ
    function asyncTokenize(){
        return new Promise((resolve, rejects) => {
            //console.log(2);
            let path = './data/cur_DB';
            tokenized = simpleTfidfDB.tokenize_DBdata(path, 'content');
            let bid = tokenized[0];
            let content = tokenized[1];
            // �ߺ��ܾ� ����
            for(let i=0;i<bid.length;i++){
                if(content[i].length === 0) continue;
                let uniqueWords = [];
                content[i].forEach((element) => {
                    if(!uniqueWords.includes(element)){
                        uniqueWords.push(element);
                    }
                });
                tokenized[1][i] = uniqueWords;
            }

            path = './data/cur_token_DB'
            simpleTfidfDB.save_document_file(path, tokenized);
            return resolve();
        })
    }

    console.time('DB fetch');
    await asyncFetch();
    console.timeEnd('DB fetch');
    console.time('tokenize');
    await asyncTokenize();
    console.timeEnd('tokenize');
    
    console.time('make inverted index');
    let invertedIndex = []; // {word: a, bid: []}
    let bid = tokenized[0];
    let content = tokenized[1];
    for(let i=0;i<bid.length;i++){
        //console.log(bid[i]);
        //console.log(content[i]);
        if(content[i].length === 0) continue;

        // �Խñۿ� �ִ� �ܾ� ��ȸ
        for(word of content[i]){
            if(invertedIndex.length === 0){
                let temp = {
                    word: word,
                    bid: [bid[i]]
                }
                invertedIndex.push(temp);
            }
            else{
                let found = 0;
                // �����ο� �̹� �ִ� �ܾ�� bid�� �߰���
                for(let j=0;j<invertedIndex.length;j++){
                    item = invertedIndex[j];
                    if(item.word === word){
                        found = 1;
                        item.bid.push(bid[i]);
                        break;
                    }
                }
                // �����ο� ���� �ܾ�� ���ο� ������Ʈ�� �߰� �� ����
                if(!found){
                    let temp = {
                        word: word,
                        bid: [bid[i]]
                    }
                    invertedIndex.push(temp);
                    invertedIndex.sort((a, b) => {
                        return ( a.word < b.word ) ? -1 : ( a.word == b.word ) ? 0 : 1;
                    })
                }
            }
        }        
    }
    //console.log(invertedIndex);

    let path = './data/cur_invertedIndex_DB';
    simpleTfidfDB.save_document_file(path, invertedIndex);
    console.timeEnd('make inverted index');

    return;
}

async function update_invertedIndex_file(){
    let tokenized = [];
    // �ֽ� bid ������
    function get_latest_bid(){
        return new Promise((resolve, rejects) => {
            db.query('select bid from board2 order by bid DESC LIMIT 1', (err, row) => {
                if(err) return rejects(err);
                return resolve(row[0].bid);
            })
        })
    }
    // ������Ʈ�ؾ� �� �Խñ� ������
    function get_latest_posts(cur, latest){
        return new Promise((resolve, rejects) => {
            let qry = 'select * from board2 order by bid DESC LIMIT ?';
            db.query(qry, [latest-cur], (err, rows) => {
                if(err) return rejects(err);
                let DBdata = rows.map(v => Object.assign({}, v));
                let path = './data/latest_DB';
                simpleTfidfDB.save_document_file(path, DBdata);
                return resolve();
            })
        })
    }
    // ��ūȭ
    function asyncTokenize(){
        return new Promise((resolve, rejects) => {
            let path = './data/latest_DB';
            tokenized = simpleTfidfDB.tokenize_DBdata(path, 'content');
            let bid = tokenized[0];
            let content = tokenized[1];
            // �ߺ��ܾ� ����
            for(let i=0;i<bid.length;i++){
                if(content[i].length === 0) continue;
                let uniqueWords = [];
                content[i].forEach((element) => {
                    if(!uniqueWords.includes(element)){
                        uniqueWords.push(element);
                    }
                });
                tokenized[1][i] = uniqueWords;
            }

            path = './data/latest_token_DB'
            simpleTfidfDB.save_document_file(path, tokenized);
            return resolve();
        })
    }
    let cur_bid = simpleTfidfDB.load_document_file('./data/cur_bid');
    let latest_bid = await get_latest_bid();
    console.log(cur_bid, latest_bid);
    if(cur_bid === latest_bid) return;

    await get_latest_posts(cur_bid, latest_bid);
    await asyncTokenize();
    let invertedIndex = simpleTfidfDB.load_document_file('./data/cur_invertedIndex_DB');
    let bid = tokenized[0];
    let content = tokenized[1];

    for(let i=0;i<bid.length;i++){
        //console.log(bid[i]);
        //console.log(content[i]);
        if(content[i].length === 0) continue;

        // �Խñۿ� �ִ� �ܾ� ��ȸ
        for(word of content[i]){
            let found = 0;
            // �����ο� �̹� �ִ� �ܾ�� bid�� �߰���
            for(let j=0;j<invertedIndex.length;j++){
                item = invertedIndex[j];
                if(item.word === word){
                    found = 1;
                    item.bid.push(bid[i]);
                    break;
                }
            }
            // �����ο� ���� �ܾ�� ���ο� ������Ʈ�� �߰� �� ����
            if(!found){
                let temp = {
                    word: word,
                    bid: [bid[i]]
                }
                invertedIndex.push(temp);
                invertedIndex.sort((a, b) => {
                    return ( a.word < b.word ) ? -1 : ( a.word == b.word ) ? 0 : 1;
                })
            }
        }
    }

    let path = './data/cur_invertedIndex_DB';
    simpleTfidfDB.save_document_file(path, invertedIndex);
    path = './data/cur_bid';
    simpleTfidfDB.save_document_file(path, latest_bid);

    return;
}



module.exports = {
    csv_to_DB,
    save_DBdata_file,
    save_token_DBdata,
    make_big_DBdata,
    save_tfidf_DBdata,
    NLP_token_file,
    NLP_tfidf_file,
    save_invertedIndex_file,
    update_invertedIndex_file,
};