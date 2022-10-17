const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const router = require('./router/index.js');
const cors = require('cors');
const request = require('request');
const cookieParser = require('cookie-parser');
const QuestionRoutes = require('./router/QuestionRoutes.js');
const UserRoutes = require('./router/UserRoutes.js');
const ChatRoutes = require('./router/ChatRoutes.js');
const config = require('../data/config.js').development;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: config.url + ':' + config.client.port, // http://3.90.201.108:3000, http://localhost:3000
    credentials: true,
}));

app.use('/', UserRoutes);
app.use('/', QuestionRoutes);
app.use('/', ChatRoutes);
app.use('/', router);


const port = config.server.port;
/*app.listen(port, ()=>{
    console.log(`Listening on port ${port}..`);
})*/
http.createServer(app).listen(port);
//https.createServer(app).listen(port);