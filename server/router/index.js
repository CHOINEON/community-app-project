const { query } = require('express');
const express = require('express');
const router = express.Router();
const db = require('../dbconnection');
const util = require('util');
const nat = require('../natural');

let NUM = '10k';
let server_tfidf = nat.load_document_file('/home/ksh/node-project/server/tfidf_DBdata_' + NUM);
//console.log(server_tfidf);

router.get('/api/saveTokenizedDBdata', (req, res) => {
    let DBdata = [];
    db.query('select bid, title from board2', (err, rows) =>{
        DBdata = rows.map(v => Object.assign({}, v));
    
        let natural = require('../natural.js');
        let document = [];
        for(let i=0;i<10000;i++){
            document.push(DBdata[i]);
        }
        console.log(document);
        
        console.time('tokenize time');
        let tokenized_document = [];
        for(i in document){
            tokenized_document.push(natural.tokenizer_DB(document[i]));
        }
        console.log(tokenized_document);
        
        for(let i=0;i<49;i++){
            for(let j=0;j<10000;j++){
                tokenized_document.push(tokenized_document[j]);
            }
        }
        console.log(tokenized_document);
        
        let path = '/home/ksh/node-project/server/tokenized_DBdata';
        natural.save_document_file(path, tokenized_document);
        console.log('document number: ', document.length);
        console.timeEnd('tokenize time');
        res.send('done');
    });
})

router.get('/api/saveTfidfDBdata', (req, res) => {
    console.time('runtime');
    let natural = require('../natural.js');
    const fs = require('fs');
    let document = [];
    let num = NUM;
    
    // 미리 토큰화된 문서들 가져오기
    console.time('read file time');
    let path = '/home/ksh/node-project/server/tokenized_DBdata_' + num;
    let tokenized_document = natural.load_document_file(path);
    //console.log(tokenized_document);
    console.timeEnd('read file time');
    
    // 모든 단어에 index 매핑
    let result = natural.build_bag_of_words_DB(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    let vocab_obj = [];
    for(const [key, value] of vocab){
        let temp_obj ={
            key: key,
            value: value
        };
        //console.log(key, value);
        vocab_obj.push(temp_obj);
    }
    path = '/home/ksh/node-project/server/vocab_DBdata_' + num;
    natural.save_document_file(path, vocab_obj);
    //console.log('vocab: ', vocab);
    //console.log('bow: ', bow);
    
    // 모든 단어의 idf 구하기
    let idf = natural.get_idf_DB(bow, vocab);
    path = '/home/ksh/node-project/server/idf_DBdata_' + num;
    natural.save_document_file(path, idf);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = natural.get_tfidf_DB(bow, idf);
    //console.log(tfidf);
    
    path = '/home/ksh/node-project/server/tfidf_DBdata_' + num;
    natural.save_document_file(path, tfidf);
    console.log('document number: ', tfidf.length);
    console.timeEnd('runtime');
});

router.get('/api/NLPwithTfidfFile', async (req, res) => {
    console.time('runtime');
    let natural = require('../natural.js');
    let document = [];
    let num = NUM;
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    // 유저 질문 토큰화
    let tokenized_UserQ = natural.tokenizer_DB(UserQ);
    //console.log(tokenized_UserQ);
    
    console.time('read file time');
    // 미리 저장된 단어 사전 불러오기
    let path = '/home/ksh/node-project/server/vocab_DBdata_' + num;
    let vocab_file = natural.load_document_file(path);
    let vocab = new Map();
    for(let i in vocab_file){
        //console.log(vocab_file[i]);
        vocab.set(vocab_file[i].key, vocab_file[i].value);
    }
    //console.log(vocab);
    
    // 미리 저장된 idf 불러오기
    path = '/home/ksh/node-project/server/idf_DBdata_' + num;
    let idf = natural.load_document_file(path);
    //console.log(idf);
    
    // 미리 저장된 tfidf 불러오기
    console.time('read tfidf time');
    //path = '/home/ksh/node-project/server/tfidf_DBdata_' + num;
    //let tfidf = natural.load_document_file(path);
    let tfidf = server_tfidf;
    //console.log(tfidf);
    console.timeEnd('read tfidf time');
    console.timeEnd('read file time');
    
    // 유저 질문 토큰이 단어 사전에 존재하는지 확인
    let token_matched_index = [];
    for(let i in tokenized_UserQ.title){
        let index = vocab.get(tokenized_UserQ.title[i]);
        //console.log(index);
        if(index != null){
            token_matched_index.push(index);
        }
    }
    if(token_matched_index.length === 0){
        console.log('no similar post');
        return;
    }
    //console.log(token_matched_index);
    
    // 유저 질문 tf 구하기
    let bow_obj_UserQ = {};
    let bow_temp = [];
    for(let i in token_matched_index){
        if(bow_temp.length === 0){
            let pair = {
                index: token_matched_index[i],
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
                index: token_matched_index[i],
                value: 1
            };
            bow_temp.push(pair);
        }
    }
    bow_temp.shift();
    bow_obj_UserQ = {
        bid: tokenized_UserQ.bid,
        bow: bow_temp
    };
    //console.log(bow_obj_UserQ);
    
    // 유저 질문 tfidf 구하기
    let tfidf_obj_UserQ = {};
    let tfidf_temp = [];
    for(let i in bow_obj_UserQ.bow){
        let t = bow_obj_UserQ.bow[i].value * idf[bow_obj_UserQ.bow[i].index];
        let pair = {
            index: bow_obj_UserQ.bow[i].index,
            value: t
        };
        tfidf_temp.push(pair);
    }
    tfidf_obj_UserQ = {
        bid: bow_obj_UserQ.bid,
        tfidf: tfidf_temp
    };
    //console.log(tfidf_obj_UserQ);
    
    // 유저 질문 tfidf를 미리 저장된 tfidf와 합침
    tfidf.unshift(tfidf_obj_UserQ);
    //console.log(tfidf);
    
    // 유저 질문 tfidf와 미리 저장된 tfidf값을 코사인 유사도 검사함
    let cos_sim = natural.cosine_similarity_DB(tfidf);
    console.log(cos_sim);
    
    tfidf.shift();
    
    console.timeEnd('runtime');
    res.send('done');
});

router.get('/api/NLPwithTfidfFileTest', async (req, res) => {
    let natural = require('../natural.js');
    let document = [];
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    // 유저 질문 토큰화
    let tokenized_UserQ = natural.tokenizer_DB(UserQ);
    //console.log(tokenized_UserQ);
    
    let time = [];
    let time_file = [];
    let time_cosine = [];
    let sum = 0;
    let sum_file = 0;
    let sum_cosine =0;
    
    for(let i=0;i<10;i++){
    let start_run = new Date;
    
    
    // 미리 저장된 단어 사전 불러오기
    let path = '/home/ksh/node-project/server/vocab_DBdata_100k';
    let vocab_file = natural.load_document_file(path);
    let vocab = new Map();
    for(let i in vocab_file){
        //console.log(vocab_file[i]);
        vocab.set(vocab_file[i].key, vocab_file[i].value);
    }
    //console.log(vocab);
    
    // 미리 저장된 idf 불러오기
    path = '/home/ksh/node-project/server/idf_DBdata_100k';
    let idf = natural.load_document_file(path);
    //console.log(idf);
    
    // 미리 저장된 tfidf 불러오기
    //path = '/home/ksh/node-project/server/tfidf_DBdata_100k';
    //let tfidf = natural.load_document_file(path);
    let tfidf = server_tfidf;
    //console.log(tfidf);
    let end_time_file = new Date;
    let temp = (end_time_file - start_run)/1000;
    sum_file+=temp;
    time_file.push(temp);
    
    // 유저 질문 토큰이 단어 사전에 존재하는지 확인
    let token_matched_index = [];
    for(let i in tokenized_UserQ.title){
        let index = vocab.get(tokenized_UserQ.title[i]);
        //console.log(index);
        if(index != null){
            token_matched_index.push(index);
        }
    }
    if(token_matched_index.length === 0){
        console.log('no similar post');
        return;
    }
    //console.log(token_matched_index);
    
    // 유저 질문 tf 구하기
    let bow_obj_UserQ = {};
    let bow_temp = [];
    for(let i in token_matched_index){
        if(bow_temp.length === 0){
            let pair = {
                index: token_matched_index[i],
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
                index: token_matched_index[i],
                value: 1
            };
            bow_temp.push(pair);
        }
    }
    bow_temp.shift();
    bow_obj_UserQ = {
        bid: tokenized_UserQ.bid,
        bow: bow_temp
    };
    //console.log(bow_obj_UserQ);
    
    // 유저 질문 tfidf 구하기
    let tfidf_obj_UserQ = {};
    let tfidf_temp = [];
    for(let i in bow_obj_UserQ.bow){
        let t = bow_obj_UserQ.bow[i].value * idf[bow_obj_UserQ.bow[i].index];
        let pair = {
            index: bow_obj_UserQ.bow[i].index,
            value: t
        };
        tfidf_temp.push(pair);
    }
    tfidf_obj_UserQ = {
        bid: bow_obj_UserQ.bid,
        tfidf: tfidf_temp
    };
    //console.log(tfidf_obj_UserQ);
    
    // 유저 질문 tfidf를 미리 저장된 tfidf와 합침
    tfidf.unshift(tfidf_obj_UserQ);
    //console.log(tfidf);
    
    // 유저 질문 tfidf와 미리 저장된 tfidf값을 코사인 유사도 검사함
    let cos_sim = natural.cosine_similarity_DB(tfidf);
    console.log(cos_sim);
    
    tfidf.shift();
    
    let end_run = new Date();
    let t = (end_run-start_run)/1000;
    sum+=t;
    time.push(t);
    console.log('documnet number : ', tfidf.length);
    console.log('file read time : ', temp, ' s');
    console.log('function runtime : ', t, ' s');
    console.log(time_file);
    console.log(time);
    console.log('average file read time : ', sum_file/10);
    console.log('average time : ', sum/10);
    
    }
    
    
    res.send('done');
});

router.get('/api/NLPtest', async (req, res) => {
    let natural = require('../natural.js');
    let document = [];
    document.push('정부가 발표하는 물가상승률과 소비자가 느끼는 물가상승률은 다르다.');
    document.push('소비자는 주로 소비하는 상품을 기준으로 물가상승률을 느낀다.');

     // 문서 토큰화
     let tokenized_document = [];
     for(i in document){
         tokenized_document.push(natural.tokenizer(document[i]));
     }
     console.log('tokenized_document : ', tokenized_document);
     
     // 모든 단어에 index 맵핑
     let result = natural.build_bag_of_words(tokenized_document);
     let vocab = result[0];
     let bow = result[1];
     console.log(bow.length);
     
     // 모든 단어의 idf 구하기
     let idf = natural.get_idf(bow);
     
     // 모든 문서의 tfidf 구하기
     let tfidf = natural.get_tfidf(bow, idf);
     
     // 0번 문서와 나머지 문서의 유사도 검사
     let cos_sim = natural.cosine_similarity(tfidf);
    
    res.send('done');
});

router.get('/api/NLPwithFile', async (req, res) => {
    console.time('runtime');
    let natural = require('../natural.js');
    let document = [];
    let num = NUM;
    
    // 미리 토큰화된 문서들 가져오기
    console.time('read file time');
    let path = '/home/ksh/node-project/server/tokenized_DBdata_' + num;
    let tokenized_document = natural.load_document_file(path);
    //console.log(tokenized_document);
    console.timeEnd('read file time');
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    // 유저의 질문과 토큰화된 문서 합치기
    let tokenized_UserQ = natural.tokenizer_DB(UserQ);
    tokenized_document.unshift(tokenized_UserQ);
    //console.log(tokenized_UserQ);

    // 모든 단어에 index 매핑
    let result = natural.build_bag_of_words_DB(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // 모든 단어의 idf 구하기
    let idf = natural.get_idf_DB(bow, vocab);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = natural.get_tfidf_DB(bow, idf);
     
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = natural.cosine_similarity_DB(tfidf);
    console.log(cos_sim);
    console.log('document number: ', tokenized_document.length);
    console.timeEnd('runtime');
    res.send('done');
});

router.get('/api/NLPwithFileTest', async (req, res) => {
    let natural = require('../natural.js');
    let document = [];
    
    // 미리 토큰화된 문서들 가져오기
    console.time('read file time');
    let path = '/home/ksh/node-project/server/tokenized_DBdata_100k';
    let tokenized_document = natural.load_document_file(path);
    //console.log(tokenized_document);
    console.timeEnd('read file time');
    
    let UserQ = {
        bid: 0,
        title: '파이썬으로 크롤링하는 방법 질문이요',
    };
    
    // 유저의 질문과 토큰화된 문서 합치기
    let tokenized_UserQ = natural.tokenizer_DB(UserQ);
    tokenized_document.unshift(tokenized_UserQ);

    let time = [];
    let sum = 0;
    for(let i=0;i<10;i++){
      let start = new Date();
      
      // 모든 단어에 index 매핑
      let result = natural.build_bag_of_words_DB(tokenized_document);
      let vocab = result[0];
      let bow = result[1];
      
      // 모든 단어의 idf 구하기
      let idf = natural.get_idf_DB(bow, vocab);
       
      // 모든 문서의 tfidf 구하기
      let tfidf = natural.get_tfidf_DB(bow, idf);
       
      // 0번 문서와 나머지 문서의 유사도 검사
      let cos_sim = natural.cosine_similarity_DB(tfidf);
      console.log(cos_sim);
      
      let end = new Date();
      let t = (end-start)/1000;
      sum+=t;
      time.push(t);
      console.log(tokenized_document.length);
      console.log('function runtime : ', t, ' s');
      console.log(time);
      console.log('average time : ', sum/10);
    }
    
    res.send('done');
});


router.get('/', (req, res) => {
    res.send({data : 'hello world'});
});

router.get('/group',(req, res)=>res.json({
    username:'group brrrr'
}))

router.get('/getData',(req,res) => {
    db.query("select * from `Member`", (err, rows) =>{
        if(!err){
            console.log(rows);
            res.send(rows);
        }
        else{
            console.log(`query error : ${err}`);
            res.send(err);
        }
    })
});

router.post('/api/insert',(req, res) => {
    const id = req.body.id;
    const pw = req.body.pw;
    db.query("insert into Member (User_id, User_pw) values (?,?)", [id, pw], (err, result) => {
        res.send(result);
    });
})

router.get('/api/login', (req, res) => {
    const User_id = req.query.id;
    const User_pw = req.query.pw;
    //console.log(req.body.id,req.body.pw);
    console.log('로그인1');
    console.log(req.query);

    db.query('select count(*) as cnt from Member where User_id=? and User_pw=?', [User_id, User_pw], (err, rows)=>{
        if(!err){
            console.log(rows[0].cnt);
            console.log();
            res.send({rs : rows[0].cnt});
        }
        else{
            res.send('error :'+ err);
        }
    })
})

router.post('/api/login2', (req, res) => {
    //console.log(`= = = > req : ${util.inspect(req)}`)

    const User_id = req.query.id;
    const User_pw = req.query.pw;
    console.log('로그인2');
    console.log(req.query);

    const sqlLogin = 'select count(*) as result from Member where User_id = ? and User_pw = ?'
    db.query(sqlLogin, [User_id, User_pw], (err, data) => {
        if(!err) {
        	// 결과값이 1보다 작다면(동일한 id 가 없다면)
            if(data[0].result < 1) {
                res.send({ 'msg': '입력하신 id 가 일치하지 않습니다.'})
            } 
            else { // 동일한 id 가 있으면 비밀번호 일치 확인
                const sql2 = `SELECT 
                                CASE (SELECT COUNT(*) FROM Member WHERE User_id = ? AND User_pw = ?)
                                    WHEN '0' THEN NULL
                                    ELSE (SELECT User_id FROM Member WHERE User_id = ? AND User_pw = ?)
                                END AS userId
                                , CASE (SELECT COUNT(*) FROM Member WHERE User_id = ? AND User_pw = ?)
                                    WHEN '0' THEN NULL
                                    ELSE (SELECT user_pw FROM Member WHERE User_id = ? AND User_pw = ?)
                                END AS userPw`;
                // sql 란에 필요한 parameter 값을 순서대로 기재
                const params = [User_id, User_pw, User_id, User_pw, User_id, User_pw, User_id, User_pw]
                db.query(sql2, params, (err, data) => {
                    if(!err) {
                        res.send(data[0])
                    } 
                    else {
                        res.send(err)
                    }
                })
            }
        } 
        else {
            res.send(err)
        }
    })
})

router.post('/api/login3', (req, res) => {
    console.log('로그인3');
    console.log(req.body);
    const User_id = req.body?.id;
    const User_pw = req.body?.pw;
    //console.log(req.body.id,req.body.pw);

    db.query('select count(*) as cnt from Member where User_id=? and User_pw=?', [User_id, User_pw], (err, rows)=>{
        if(!err){
            console.log(rows[0].cnt);
            console.log();
            res.send({rs : rows[0].cnt});
        }
        else{
            res.send('error :'+ err);
        }
    })
})

router.get('/api/getSimilarPost', (req, res) => {
    console.log('질문 유사도 검사');
    console.time('node runtime');
    
    const pythonShell = require('python-shell');
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ['title', 'content', 'url']
    };
  
    pythonShell.PythonShell.run('/home/ksh/node-project/server/cosine_similarity_test.py', options, (err, results) => {
    if (err) throw err;
    
    console.log(results);
    console.timeEnd('node runtime');
    res.send(results);
    });
})

router.get('/api/getCsv', (req, res) => {
    console.log('csv 파일 테스트');
    
    var question = 'C++ vector';        // 사용자의 질문(임의로 만듬)
    question = question + ',' + ',' + '\n';  // csv형식에 맞게 변형
    console.log(question);
    
    const fs = require('fs');
    
    fs.readFile('/home/ksh/node-project/server/OKKY C++ utf8.csv', 'utf8', (err, data) => {  // csv 파일 읽어옴
        if(err) throw err;
        console.log('csv read');
        var dataArray = data.split(/\r?\n/);
        //console.log(dataArray[1]);
        
        dataArray.splice(1, 0, question);  // csv 파일에 사용자의 질문 추가
        console.log(dataArray[1]);
        
        var dataStr = '';
        for (var i in dataArray){  // csv 파일에 맞게 string 형태로 만듬
            dataStr = dataStr + dataArray[i] + '\n';
            if(i<2){
              console.log(dataStr);
            }
        }
        
        
        res.send(dataStr);
        
        fs.writeFileSync('OKKY C++ utf8 added.csv', dataStr);  // csv 파일 쓰기
        
    })
    
    
    //res.send('end');
})

router.get('/api/CSVToDB', (req, res) => {
    console.log('csv to DB');
    const fs = require('fs');
    const csv = require('csv-parser');
    const dataArray = [];
    
    fs.createReadStream('/home/ksh/node-project/server/OKKY Q&A 20k utf8.csv')
          .pipe(csv({delimiter: ','}))
          .on("data", (row) => {
            dataArray.push(row);
          })
          .on("end", () => {
          
            /*
            // 중복 제거
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
            
            
            // db로 옮기기
            let contentMax = 0;
            let titleMax = 0;
            for(var i in dataArray){
              const title = dataArray[i]["title"];
              const content = dataArray[i]["content"];
              // max size 체크
              if(contentMax<content.length){
                contentMax = content.length;
              }
              if(titleMax<title.length){
                titleMax = title.length;
              }
              
              
              db.query('insert into board2 (title, content)values (?,?)', [title, content], (err, rows)=>{
                if(!err){
                }
                else{
                  console.log(err);
                }
              });
              
            }
            
            console.log(dataArray);
            res.send('done');
            
            console.log(titleMax);
            console.log(contentMax);
        });
})


router.post('/api/expectedAnswer',(req, res) => {
    console.time('node runtime');
    const title = req.body.title;
    console.log(title);
    let natural = require('../natural.js');
    let num = NUM;
    
    var UserQ = {
      bid : 0,
      title : title
    }
    //console.log(userQ);
      
    // 유저 질문 토큰화
    let tokenized_UserQ = natural.tokenizer_DB(UserQ);
    console.log(tokenized_UserQ);
    
    console.time('read file time');
    // 미리 저장된 단어 사전 불러오기
    let path = '/home/ksh/node-project/server/vocab_DBdata_' + num;
    let vocab_file = natural.load_document_file(path);
    let vocab = new Map();
    for(let i in vocab_file){
        //console.log(vocab_file[i]);
        vocab.set(vocab_file[i].key, vocab_file[i].value);
    }
    //console.log(vocab);
    
    // 미리 저장된 idf 불러오기
    path = '/home/ksh/node-project/server/idf_DBdata_' + num;
    let idf = natural.load_document_file(path);
    //console.log(idf);
    
    // 미리 저장된 tfidf 불러오기
    console.time('read tfidf time');
    //path = '/home/ksh/node-project/server/tfidf_DBdata_' + num;
    //let tfidf = natural.load_document_file(path);
    let tfidf = server_tfidf;
    //console.log(tfidf);
    console.timeEnd('read tfidf time');
    console.timeEnd('read file time');
    
    // 유저 질문 토큰이 단어 사전에 존재하는지 확인
    let token_matched_index = [];
    for(let i in tokenized_UserQ.title){
        let index = vocab.get(tokenized_UserQ.title[i]);
        //console.log(index);
        if(index != null){
            token_matched_index.push(index);
        }
    }
    if(token_matched_index.length === 0){
        console.log('no similar post');
        return;
    }
    //console.log(token_matched_index);
    
    // 유저 질문 tf 구하기
    let bow_obj_UserQ = {};
    let bow_temp = [];
    for(let i in token_matched_index){
        if(bow_temp.length === 0){
            let pair = {
                index: token_matched_index[i],
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
                index: token_matched_index[i],
                value: 1
            };
            bow_temp.push(pair);
        }
    }
    bow_temp.shift();
    bow_obj_UserQ = {
        bid: tokenized_UserQ.bid,
        bow: bow_temp
    };
    //console.log(bow_obj_UserQ);
    
    // 유저 질문 tfidf 구하기
    let tfidf_obj_UserQ = {};
    let tfidf_temp = [];
    for(let i in bow_obj_UserQ.bow){
        let t = bow_obj_UserQ.bow[i].value * idf[bow_obj_UserQ.bow[i].index];
        let pair = {
            index: bow_obj_UserQ.bow[i].index,
            value: t
        };
        tfidf_temp.push(pair);
    }
    tfidf_obj_UserQ = {
        bid: bow_obj_UserQ.bid,
        tfidf: tfidf_temp
    };
    //console.log(tfidf_obj_UserQ);
    
    // 유저 질문 tfidf를 미리 저장된 tfidf와 합침
    tfidf.unshift(tfidf_obj_UserQ);
    //console.log(tfidf);
    
    // 유저 질문 tfidf와 미리 저장된 tfidf값을 코사인 유사도 검사함
    let cos_sim = natural.cosine_similarity_DB(tfidf);
    console.log(cos_sim);
    
    tfidf.shift();
    
    var sql1 = `select title, content from board2 where bid = ${cos_sim[0]};`;
    var sql2 = `select title, content from board2 where bid = ${cos_sim[1]};`;
    var sql3 = `select title, content from board2 where bid = ${cos_sim[2]};`;
    var sql4 = `select title, content from board2 where bid = ${cos_sim[3]};`;
    var sql5 = `select title, content from board2 where bid = ${cos_sim[4]};`;
    
    var queryResult = [];
    db.query(sql1+sql2+sql3+sql4+sql5, (err, rows) => {
      if(err) throw err;
      //queryResult.push(rows[0].map(v => Object.assign({}, v)));
      //queryResult.push(rows[1].map(v => Object.assign({}, v)));
      //queryResult.push(rows[2].map(v => Object.assign({}, v)));
      //queryResult.push(rows[3].map(v => Object.assign({}, v)));
      //queryResult.push(rows[4].map(v => Object.assign({}, v)));
      queryResult.push(rows[0][0]);
      queryResult.push(rows[1][0]);
      queryResult.push(rows[2][0]);
      queryResult.push(rows[3][0]);
      queryResult.push(rows[4][0]);
      console.log(queryResult);
      //console.log(queryResult[1].title);
      res.send(queryResult);
    });
    console.timeEnd('node runtime');
});



router.post('/api/android/login', (req, res) => {
    console.log('안드로이드 로그인');
    console.log(req.body);
    const User_id = req.body?.id;
    const User_pw = req.body?.pw;

    db.query('select count(*) as cnt, User_seq from Member where User_id=? and User_pw=?', [User_id, User_pw], (err, rows)=>{
        if(!err){
            console.log(rows[0]);
            console.log();
            res.send(rows[0]);
        }
        else{
            res.send('error :'+ err);
        }
    })
})

router.get('/api/android/getMember',(req,res) => {
    db.query("select * from `Member`", (err, rows) =>{
        if(!err){
            console.log(rows);
            res.send(rows);
        }
        else{
            console.log(`query error : ${err}`);
            res.send(err);
        }
    })
});

router.get('/api/android/getNode',(req,res) => {
    db.query("select * from `Node`", (err, rows) =>{
        if(!err){
            console.log(rows);
            res.send(rows);
        }
        else{
            console.log(`query error : ${err}`);
            res.send(err);
        }
    })
});

router.get('/api/android/getEdge',(req,res) => {
    db.query("select * from `Edge`", (err, rows) =>{
        if(!err){
            console.log(rows);
            res.send(rows);
        }
        else{
            console.log(`query error : ${err}`);
            res.send(err);
        }
    })
});

router.post('/api/android/addRecentPath', (req, res) => {
    console.log('안드로이드 최근 경로 추가');
    console.log(req.body);
    const User_seq = req.body?.User_seq;
    const cost = req.body?.cost;
    const path = req.body?.path;
    //console.log(req.body.id,req.body.pw);

    db.query('insert into RecentPath values (?,?,?)', [cost, path, User_seq], (err, rows)=>{
        if(!err){
            console.log("new recent path added");
            console.log();
            res.send({rs : 'new recent path added'});
        }
        else{
            res.send('error :'+ err);
        }
    })
})

router.post('/api/android/getRecentPath', (req, res) => {
    console.log('안드로이드 최근 경로 조회');
    console.log(req.body);
    const User_seq = req.body?.User_seq;

    db.query('select * from RecentPath where User_seq=?', [User_seq], (err, rows)=>{
        if(!err){
            console.log(rows);
            console.log();
            res.send(rows);
        }
        else{
            res.send('error :'+ err);
        }
    })
})

module.exports = router;