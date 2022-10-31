const express = require('express');
const ChatRoutes = express.Router();
const db = require('../dbconnection');

function getChatRoom(question_id) {
    return new Promise(function(resolved, rejected) {
        db.query('select * from chatRoom where question_id=?', [question_id], (err, rows) => {
            if(err) res.sendStatus(422);
            else{
                let chatRoom = rows[0];
                //console.log(chatRoom);
                return resolved(chatRoom);
            }
        })
    });
}

function getChattings(question_id) {
    return new Promise(function(resolved, rejected) {
        db.query('select * from chat where question_id=? ', [question_id], (err, rows) => {
            if(err) res.sendStatus(422);
            else{
                let chattings = rows;
                //console.log(chattings);
                return resolved(chattings);
            }
        })
    });
}

ChatRoutes.get('/chats/:id', (req, res) => {
    const debate_id = req.params.id;
    let qry = 'select debate_id, user_id, user_email, message, date from chat2 where debate_id = ? order by date ASC';
    db.query(qry, [debate_id], (err, rows) => {
        if(err) res.sendStatus(422);
        else{
            //console.log(rows);
            res.json(rows);
        }
    });
});

ChatRoutes.get('/chatRooms/:id', async (req, res) =>{
    const question_id = req.params.id;
    const chatRoom = await getChatRoom(question_id);
    const chattings = await getChattings(question_id);
    let result = {
        chatRoom: chatRoom,
        chattings: chattings,
    }
    //console.log(chatRoom);
    if(chatRoom) res.send(result);
})

ChatRoutes.post('/chatting', (req, res) => {
    //console.log(req.body);
    const token = req.cookies.token;

    // const qry1 = 'select User_id from Member where token=?';
    // db.query(qry1, [token], (err, rows) => {
    //     if(err) res.sendStatus(422);
    //     else{
    //         let user_id = rows[0].User_id;
    //         console.log(user_id);
    //         const qry2 = 'insert into chat (question_id, user_id, content) value (?, ?, ?)';
    //         db.query(qry2, [question_id, user_id, message], (err, rows) => {
    //             if(err) res.sendStatus(422);
    //             else{
    //                 db.query('select * from chat where id=?',[rows.insertId], (err, rows) => {
    //                     if(err) res.sendStatus(422);
    //                     else{
    //                         //console.log(rows[0]);
    //                         res.send(rows[0]);
    //                     }
    //                 })
    //             }
    //         })
    //     }
    // })
})

module.exports = ChatRoutes;