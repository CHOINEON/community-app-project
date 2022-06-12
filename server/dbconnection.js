const mysql = require('mysql');
const connection = mysql.createPool({
    host: 'nodejs-rds.cfcfngacc7ov.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: '12341234',
    database: 'testdb',
    multipleStatements: true
});

module.exports = connection;