const express = require("express")
const http = require("http")
const app = express();
const path = require("path")//서버주소 불러오기위한 nodejs기본모듈
const server = http.createServer(app);
const socketIO = require ("socket.io")
const moment = require("moment")
const io = socketIO(server);//이 io를 통해 메세지 받거나 제어 할 예정

app.use(express.static(path.join(__dirname, "src")))
const PORT = process.env.PORT || 5000;


io.on("connection", (socket) => {
   socket.on("chatting",(data) => {
      const {name, msg} = data;
      io.emit("chatting",{
         name,
         msg,
         time: moment(new Date()).format("h:ss A")
      })
   })
})

server.listen(PORT, () => console.log(`server is running ${PORT})`))