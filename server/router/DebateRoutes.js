const express = require('express');
const DebateRoutes = express.Router();
const db = require('../dbconnection');

DebateRoutes.post('/debates', (req, res) =>{
    let {title, content, user, startDate, endDate} = req.body;
    let state = 0;
    console.log(req.body);
    console.log(startDate);
    console.log(endDate);
    const qry = `insert into debate (title, content, User_seq, state, startDate, endDate) value (?,?,?,?,?,?)`;
    db.query(qry, [title,content,user,state,startDate,endDate], (err, rows) => {
        if(err) res.sendStatus(422);
        console.log(rows);
        res.json(rows);
    })
});

DebateRoutes.get('/debates/:id', (req, res) => {
    const question_id = req.params.id;
    console.log(`Qeustion ${question_id} Detail Request`);
    
    db.query('select * from board2 where bid=?', [question_id], (err, rows)=>{
        if(err) res.sendStatus(422);
        else{
            const question = rows[0];
            //console.log(question);
            res.json(question);
        }
    })
});

DebateRoutes.get('/debates', (req, res) => {
    db.query('select * from board2 order by bid DESC Limit 20', (err, rows) =>{
        if(err) res.sendStatus(422);
        else{
            res.json(rows);
        }
    })
})

// // Make chatting room
// const qry3 = 'insert into chatRoom (question_id, user_id, valid) value (?,?,?)';
// db.query(qry3, [rows.insertId, user_seq, 1], (err, rows) => {
//     if(err) res.status(422).send('something went wrong. Sorry');
//     else{
//         console.log('chatting room ' + rows.insertId + ' created');
//     }
// })

module.exports = DebateRoutes;