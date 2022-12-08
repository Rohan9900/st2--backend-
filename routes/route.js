const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


const connectDatabase = require('../config/database')



app.get("/signup", (request, response) => {
    response.render('signup', { err: false });
});

app.get("/menu", (request, response) => {


    if (!request.cookies.token) {
        return response.redirect('/login');
    }

    response.render('menu', {
        home: "/menu",
        profile: "/profile",
        password: "/changepassword",
        logout: "/logout"

    });
});


app.get("/table", (request, response) => {


    if (!request.cookies.token) {
        return response.redirect('/login');
    }


    const decoded = jwt.verify(request.cookies.token, "secret");

    let sql = `SELECT * FROM users WHERE id=${decoded.id}`;


    connectDatabase.query(sql, async (err, result) => {
        console.log(result, err);

        if (err) {
            return response.send("Internal server error")
        };


        if (result[0].role != 'admin') {
            return response.redirect('/login');
        }

        else {
            let sql = `SELECT * FROM users WHERE role!="admin"`;


            connectDatabase.query(sql, async (err, result) => {
                console.log(result, err);

                if (err) {
                    return response.send("Internal server error")
                };


                response.render('table', { data: result, logout: '/logout' });

            })
        }

    })



});

app.get("/login", (request, response) => {

    return response.render('login', { link: "signup", err: false, errPass: false });
});


app.get("/changepassword", (request, response) => {

    return response.render('changepassword', { err: false });
});

app.post("/changepassword", (request, response) => {

    console.log(request.body)

    if (!request.cookies.token) {
        return response.redirect('/login');
    }

    const decoded = jwt.verify(request.cookies.token, "secret");

    let sql = `SELECT * FROM users WHERE id=${decoded.id}`;


    connectDatabase.query(sql, async (err, result) => {
        console.log(result, err);

        if (err) {
            return response.send("Internal server error")
        };

        if (result[0].password == request.body.oldpassword) {
            let sql = `UPDATE users SET password = "${request.body.newpassword}" WHERE id=${decoded.id};`;
            connectDatabase.query(sql, async (err, result) => {
                console.log(result, err);

                if (err) {
                    return response.send("Internal server error")
                };

                return response.redirect('/menu');

            })
        }
        else {

            return response.render('changepassword', { err: true });

        }


    });

});


app.get("/profile", (request, response) => {

    if (!request.cookies.token) {
        return response.redirect('/login');
    }

    const decoded = jwt.verify(request.cookies.token, "secret");

    let sql = `SELECT * FROM users WHERE id=${decoded.id}`;


    connectDatabase.query(sql, async (err, result) => {
        console.log(result, err);

        if (err) {
            return response.send("Internal server error")
        };



        return response.render('profile', result[0]);




    });


});


app.post("/login", (request, response) => {

    const {
        email,
        password
    } = request.body;


    let sql = `SELECT * FROM users WHERE username="${email}"`;


    connectDatabase.query(sql, async (err, result) => {
        console.log(result, err);

        if (err) {
            return response.send("Internal server error")
        };


        if (result?.length <= 0) {
            return response.render('login', { link: "signup", err: true, errPass: false });

        }



        if (password != result[0].password) {
            return response.render('login', { link: "signup", err: false, errPass: true });

        }



        //Create JWT Token

        const token = jwt.sign({ id: result[0].id }, "secret", {
            expiresIn: "100d"
        })



        const options = {

            expires: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 100
            ),
            httpOnly: true
        }

        if (result[0].role == "admin") {
            response.status(200).cookie('token', token, options).redirect('table');

        }
        else {

            response.status(200).cookie('token', token, options).redirect('menu');
        }




    });
});


app.get("/logout", (request, response) => {




    return response.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).redirect('/login');

})

app.post("/signup", (request, response) => {

    console.log(request.body)

    let data = request.body;

    var sql = `CREATE TABLE IF NOT EXISTS users (id int NOT NULL AUTO_INCREMENT,username varchar(255) NOT NULL UNIQUE,password varchar(255),name varchar(255),gender varchar(255),phone varchar(255),role varchar(255),PRIMARY KEY (id));`


    sql += `INSERT INTO users (username,password,name,gender,phone,role ) VALUES ("${data.username}","${data.psw}","${data.fname}","${data.gender}","${data.phone}","user" )`



    connectDatabase.query(sql, async (err, result) => {
        console.log(result, err);

        if (err) {
            console.log(err);
            return response.status(200).render('signup', { err: true });
        }

        else {
            return response.status(200).redirect('/login');

        }

    })

});


module.exports = app;