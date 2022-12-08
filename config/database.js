var mysql = require('mysql');


var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "login",
    port: 8111,
    multipleStatements: true
});

module.exports = connection
