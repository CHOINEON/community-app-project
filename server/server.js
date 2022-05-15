const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router/index.js');
const cors = require('cors');
const request = require('request');


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/', router);


const port = 3001;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}..`);
})