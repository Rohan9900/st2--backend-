
const http = require("http");
const express = require("express");
const { readFileSync } = require('fs');
const app = require('./routes/route');
const connectDatabase = require('./config/database')

app.set('view engine', 'ejs');
let servers = http.Server(app)


//Connecting Database
connectDatabase.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connection created with Mysql successfully");
        
    }
});


const server = servers.listen(5000, () => {
    console.log(`Web server is starting and running at http://localhost:5000`);


})
