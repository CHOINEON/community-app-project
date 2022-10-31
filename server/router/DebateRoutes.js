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

DebateRoutes.post('/debates/:id/participate', (req, res) =>{
    const debate_id = req.params.id;
    let {email} = req.body;
    console.log(debate_id, email);
    db.query('select participant from debate where id=?', [debate_id], (err, rows)=>{
        if(err) res.sendStatus(422);
        else{
            let parti = rows[0].participant;
            console.log(parti);
            parti = parti +',' +email;
            console.log(parti);
            db.query('update debate set participant=? where id=?', [parti,debate_id], (err, rows)=>{
                if(err) res.sendStatus(422);
                else{
                    console.log(rows);
                    res.json(parti);
                }
            });
            //res.json(parti);
        }
    })
});

DebateRoutes.post('/debates/:id/cancel', (req, res) =>{
    const debate_id = req.params.id;
    let {email} = req.body;
    console.log('cancel', debate_id, email);
    db.query('select participant from debate where id=?', [debate_id], (err, rows)=>{
        if(err) res.sendStatus(422);
        else{
            let parti = rows[0].participant;
            console.log(parti);
            parti = parti.replace(`,${email}`, '');
            console.log(parti);
            db.query('update debate set participant=? where id=?', [parti,debate_id], (err, rows)=>{
                if(err) res.sendStatus(422);
                else{
                    console.log(rows);
                    res.json(parti);
                }
            });
            //res.json(parti);
        }
    })
});

DebateRoutes.get('/debates/:id', (req, res) => {
    const debate_id = req.params.id;
    //console.log(`Debate ${debate_id} Detail Request`);
    
    db.query('select * from debate where id=?', [debate_id], (err, rows)=>{
        if(err) res.sendStatus(422);
        else{
            const debate = rows[0];
            //console.log(debate);
            res.json(debate);
        }
    })
});

DebateRoutes.get('/debates', (req, res) => {
    db.query('select * from debate order by id DESC Limit 20', (err, rows) =>{
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