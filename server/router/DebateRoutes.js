const express = require('express');
const DebateRoutes = express.Router();
const db = require('../dbconnection');

// // Make chatting room
// const qry3 = 'insert into chatRoom (question_id, user_id, valid) value (?,?,?)';
// db.query(qry3, [rows.insertId, user_seq, 1], (err, rows) => {
//     if(err) res.status(422).send('something went wrong. Sorry');
//     else{
//         console.log('chatting room ' + rows.insertId + ' created');
//     }
// })

module.exports = DebateRoutes;