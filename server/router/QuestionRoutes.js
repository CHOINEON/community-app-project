const express = require('express');
const QuestionRoutes = express.Router();
const db = require('../dbconnection');

QuestionRoutes.post('/questions', (req, res) =>{
    const {title, content} = req.body;
    const {token} = req.cookies;
    const qry1 = 'select User_seq from Member where token=?';
    db.query(qry1, [token], (err, rows) => {
        if(err) res.status(422).send('something went wrong. Sorry');
        else{
            const user_seq = rows[0].User_seq;
            if(rows[0] && user_seq){
                const qry2 = 'insert into board2 (title, content, author_id) value (?,?,?)';
                db.query(qry2, [title, content, user_seq], (err, rows) => {
                        if(err) res.status(422).send('something went wrong. Sorry');
                        else{
                            //console.log(rows);
                            res.json(rows);
                        }
                });
            }
            else{
                res.sendStatus(403);
            }
        }
    });


});

QuestionRoutes.get('/questions/:id', (req, res) => {
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

QuestionRoutes.get('/questions', (req, res) => {
    db.query('select * from board2 order by bid DESC Limit 20', (err, rows) =>{
        if(err) res.sendStatus(422);
        else{
            res.json(rows);
        }
    })
})

module.exports = QuestionRoutes;