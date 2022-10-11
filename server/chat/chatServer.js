const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
const path = require('path');
const port = process.env.PORT || 5000;

io.listen(port, () => {
  console.log('Chat Server listening at port %d', port);
});

// Routing
//app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
let rooms = [];
let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  socket.on('make room', (data) => {
    let room = {
      question_id: String(data),
      numUsers: 0,
    }
    rooms.push(room);
    console.log('chat room ' + data + ' added');
    console.log(rooms);
  })

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    console.log(data);
    let question_id = String(data.question_id);
    let nickname = data.user_id;
    let message = data.content;

    let room = rooms.find(v => v.question_id === question_id);
    let room_num = room.question_id;
    console.log(room);

    console.log(`${room_num} , ${socket.username} : ${message}`);
    io.to(room_num).emit('new message', data);
    // we tell the client to execute 'new message'

    //socket.broadcast.emit('new message', data);
  });

  // when the client emits 'join room', this listens and executes
  socket.on('join room', (data) => {
    if(addedUser) return;

    console.log(data);
    let question_id = (data[0]);
    let nickname = data[1];
    socket.username = nickname;

    let room = rooms.find(v => v.question_id === question_id);
    let room_num = room.question_id;
    room.numUsers++;
    console.log('connected : ' + socket.id + ' num : ' + room.numUsers);
    addedUser = true;

    socket.join(room_num);

    // socket.join('room_num', () => {
    //   console.log(nickname + ' join room ' + room_num);
    //   io.to('room_num').emit('join room', data);
    // })
  });
});