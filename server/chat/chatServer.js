const express = require('express');
const db = require('../dbconnection');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
const path = require('path');
const config = require('../../data/config.js').development;
const port = config.chatserver.port;

io.listen(port, () => {
  console.log('Chat Server listening at port %d', port);
});
console.log('Chat Server listening at port %d', port);

// Routing
//app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
let rooms = [{debate_id: 1, numUsers: 0},{debate_id: 2, numUsers: 0},{debate_id: 3, numUsers: 0},{debate_id: 4, numUsers: 0},{debate_id: 5, numUsers: 0}];
let user_list = [];
let numUsers = 0;

io.on('connection', (socket) => {
  console.log('client connected : ', socket.id);

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    let {debate_id, user_id, user_email, message, date} = data;
    console.log('chat room', debate_id, data);
    
    let room = rooms.find(v => v.debate_id == debate_id);
    io.to(room.debate_id).emit('new message', data);
    
    // save to DB
    const qry = 'insert into chat2 (debate_id, user_id, user_email, message, date) value (?, ?, ?, ?, ?)';
    db.query(qry, [debate_id, user_id, user_email, message, date], (err, rows) => {
        if(err) console.log(err);
        
    });
  });

  // when the client emits 'join room', this listens and executes
  socket.on('join room', (data) => {
    console.log('user joined room', data);
    let {debate_id, user_id, user_email, socket_id} = data;
    let user_alias = debate_id + '_' + user_email;
    socket.username = user_alias;

    if(user_list.find(element => element === user_alias) === undefined){
      user_list.push(user_alias);
      console.log('user alias : ', user_alias);
      console.log('user list', user_list);
    }
    else{
      console.log(user_alias, 'already exist');
      return;
    }

    let room = rooms.find(v => v.debate_id == debate_id);
    room.numUsers++;
    
    socket.join(room.debate_id);
    console.log('rooms : ', rooms);
    console.log('-----------------------------------');
  });

  socket.on('disconnect', () => {
    console.log('client has disconnected:' + socket.username + ':' + socket.id);
    let delete_index = user_list.find(element => element === socket.username);
    if(delete_index){
      user_list.splice(delete_index, 1);
      let room_id = socket.username.split('_', 1);
      let room = rooms.find(v => v.debate_id == room_id);
      room.numUsers--;
      console.log(rooms);
      console.log(user_list);
    }
  })
});