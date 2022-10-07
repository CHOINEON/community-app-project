const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const router = require('./router/index.js');
const cors = require('cors');
const request = require('request');
const cookieParser = require('cookie-parser');


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://3.90.201.108:3000', // http://3.90.201.108:3000, http://localhost:3000
    credentials: true,
}));

app.use('/', router);


const port = 3001;
/*app.listen(3001, ()=>{
    console.log(`Listening on port ${port}..`);
})*/
http.createServer(app).listen(3001);
//https.createServer(app).listen(3001);