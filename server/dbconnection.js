const mysql = require('mysql');
const config = require('../data/config').development;
const connection = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db,
    multipleStatements: true
});

module.exports = connection;