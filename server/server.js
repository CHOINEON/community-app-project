const express = require('express');
const app = express();
const router = require('./router/index.js');
const cors = require('cors');
const request = require('request');
const bodyParser = require('body-parser');

app.use(cors());
app.use('/', router);
app.use(bodyParser.json());

const port = 3001;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}..`);
})