const { query } = require('express');
const express = require('express');
const router = express.Router();
const db = require('../dbconnection');
const db2 = require('../dbconnectionSync.js');
const util = require('util');


router.get('/api/mecab', async (req, res) => {
    console.time('node runtime');
    let natural = require('../natural.js');
    let document = [];
    document.push('정부가 발표하는 물가상승률과 소비자가 느끼는 물가상승률은 다르다.');
    document.push('소비자는 주로 소비하는 상품을 기준으로 물가상승률을 느낀다.');
    
    let DBdata = [];
    let sql = 'select bid, title from board';
    
    //db.query('select bid, title from board', (err, rows) =>{
    //  DBdata = rows.map(v => Object.assign({}, v));
      //console.log(DBdata);
    //  console.log(DBdata[0].title);
    //  for(let i in DBdata){
    //      document.push(DBdata[i].title);
    //  }
    //});
    
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
    console.log('vocabulary : ', vocab);
    console.log('bag of words vectors(term frequency) : ', bow);
    console.log(bow.length);
    
    // 모든 단어의 idf 구하기
    let idf = natural.get_idf(bow);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = natural.get_tfidf(bow, idf);
    
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = natural.cosine_similarity(tfidf);
    
    res.send('done');
    console.timeEnd('node runtime');
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
    
    fs.createReadStream('/home/ksh/node-project/server/OKKY C++ utf8.csv')
          .pipe(csv({delimiter: ','}))
          .on("data", (row) => {
            dataArray.push(row);
          })
          .on("end", () => {
          
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
            
            // db로 옮기기
            var contentMax = 0;
            var titleMax = 0;
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
              
              db.query('insert into board (title, content)values (?,?)', [title, content], (err, rows)=>{
                if(!err){
                }
                else{
                  console.log(err);
                }
              });
            }
            
            console.log(dataArray);
            res.send(dataArray);
            
            console.log(titleMax);
            console.log(contentMax);
        });
})


router.post('/api/expectedAnswer',(req, res) => {
    console.time('node runtime');
    const title = req.body.title;
    console.log(title);
    fs = require('fs');
    
    var DBdata = [];
    db.query('select bid, title from board', (err, rows) =>{
      DBdata = rows.map(v => Object.assign({}, v));
      //console.log(DBdata[0].title);
      
      var userQ = {
        bid : 0,
        title : title
      }
      //console.log(userQ);
      
      DBdata.unshift(userQ);
      //console.log(DBdata);
      
      const { parse, Parser} = require('json2csv');
      const fields = ['bid', 'title'];
      const csv_string = parse(DBdata, { fields });
      
      //console.log(csv_string);
      fs.writeFileSync('/home/ksh/node-project/server/userQuestionAndDBdata.csv', csv_string);
      
      console.log('질문 유사도 검사');
    
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
    
      var postIndex = [];
      for(var i=2;i<7;i++){
        resultSplit = results[i].split(' ');
        postIndex.push(resultSplit[0]);
      }
      console.log(postIndex);
      
      var sql1 = `select title, content from board where bid = ${postIndex[0]};`;
      var sql2 = `select title, content from board where bid = ${postIndex[1]};`;
      var sql3 = `select title, content from board where bid = ${postIndex[2]};`;
      var sql4 = `select title, content from board where bid = ${postIndex[3]};`;
      var sql5 = `select title, content from board where bid = ${postIndex[4]};`;
      
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
      })
      console.timeEnd('node runtime');
      });
    });
    
})



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