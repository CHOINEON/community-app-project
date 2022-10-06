const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const router = require('./router/index.js');
const cors = require('cors');
const request = require('request');
const cookieParser = require('cookie-parser');


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // http://3.90.201.108:3000
    credentials: true,
}));

app.use('/', router);


const port = 3001;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}..`);
})