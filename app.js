var mysql = require('mysql2');
const express = require("express");
var app = express()
const port = 8084
const bp = require('body-parser')
const cookieParser = require("cookie-parser");
var session = require('express-session');
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
const oneDay = 1000 * 60 * 60 * 24;
require('dotenv').config();

const nodemailer = require('nodemailer')

app.use(session({
    secret: process.env.host,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(cookieParser());

var con = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

app.use(express.static(__dirname + '/'));

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.set('view engine', 'ejs');
const d = new Date();

const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
        user: process.env.emailUser,
        pass: process.env.emailPassword
    }
});

// Every 24 hours the web app checks all the application requests if it's been a year and if so sends an email.
function intervalFunc() {
    con.query('SELECT * FROM apprequest', function (err, results) {
        if (err) throw err;

        for (var i = 0; i < results.length;i++) {
            if((d.getMonth() + 1) + '/' + d.getDate() + '/' + (d.getFullYear()-1) === results[i].date) {
                const mailOptions = {
                    from: 'mgsdonlineapplicationform@gmail.com',
                    to: results[i].email,
                    subject: 'MGSD Online Application Request Notification',
                    text: 'Greetings, this is a notification that your application ' + results[i].title + ' needs to be ' +
                        're-approved by the system administrator at MGSD. Please contact Robert Rexrode at robertrexrode@mgsd.k12.nc.us for re-approval.'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            console.log("test")
        }
    });
}

setInterval(intervalFunc, 86400000);

app.get('/yesDelete/:id', function (req, res) {
    session = req.session;
    if(session.userid){
        con.query('DELETE FROM apprequest WHERE id = "' + req.params.id + '"', function (err, result) {
            if (err) throw err;
        });
        res.redirect('/profile')
    }else
        res.render('login')
});

app.get("/delete/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('delete', {app: results});
        });
    }else
        res.render('login')
});

app.post('/submitApproval/:id', function (req, res) {

    var newApproval = req.body.approval;
    session=req.session;
    if(session.userid){
        if (newApproval != "") {
            con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
                if (err) throw err;
                const mailOptions = {
                    from: 'rexrodedev@gmail.com',
                    to: results[0].email,
                    subject: 'MGSD Online Application Request Notification',
                    text: 'Greetings, this is a notification that your application ' + results[0].title + ' has been ' +
                        newApproval + ". If you have any questions please email Robert Rexrode at robertrexrode@mgsd.k12.nc.us"
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            });
            var sql = mysql.format('UPDATE apprequest SET approval = "' + newApproval + '"  WHERE id = "' + req.params.id + '"');
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });

            res.redirect('/appProfile/' + req.params.id)
        } else {
            res.send("Please fill in all fields!");
        }
    }else
        res.render('login')
});

app.get("/changeApproval/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('changeApproval', {app: results});
        });
    }else
        res.render('login')
});

app.post('/submitEula/:id', function (req, res) {

    var newEula = req.body.eula;
    session=req.session;
    if(session.userid){
        if (newEula != "") {
            var sql = mysql.format('UPDATE apprequest SET eula = "' + newEula + '"  WHERE id = "' + req.params.id + '"');
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            res.redirect('/appProfile/' + req.params.id)
        } else {
            res.send("Please fill in all fields!");
        }
    }else
        res.render('login')
});

app.get("/changeEula/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('changeEula', {app: results});
        });
    }else
        res.render('login')
});

app.post('/submitTest/:id', function (req, res) {

    var newTested = req.body.tested;
    session=req.session;
    if(session.userid){
        if (newTested != "") {
            var sql = mysql.format('UPDATE apprequest SET tested = "' + newTested + '"  WHERE id = "' + req.params.id + '"');
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            res.redirect('/appProfile/' + req.params.id)
        } else {
            res.send("Please fill in all fields!");
        }
    }else
        res.render('login')
});

app.get("/changeTested/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('changeTested', {app: results});
        });
    }else
        res.render('login')
});

app.post('/submitNote/:id', function (req, res) {

    var newNote = req.body.note;
    var begin = '\r\n['
    var end = ']'
    session=req.session;
    if(session.userid){
        if (newNote != "") {

            var sql = mysql.format('UPDATE apprequest SET notes = CONCAT(notes, "' + begin + '", "' + newNote + '", "' + end + '")  WHERE id = "' + req.params.id + '"');
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            res.redirect('/appProfile/' + req.params.id)
        } else {
            res.send("Please fill in all fields!");
        }
    }else
        res.render('login')
});

app.get("/addNotes/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('addNotes', {app: results});
        });
    }else
        res.render('login')
});

app.get("/appProfile/:id", function (req, res) {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest WHERE id = "' + req.params.id + '"', function (err, results) {
            if (err) throw err;
            res.render('appProfile', {app: results});
        });
    }else {
        res.render('login')
    }

});

app.get("/search", function (req, res) {
    session=req.session;
    var search = req.query.name;
    if(session.userid){
        if (search != "") {
            con.query('SELECT * FROM apprequest WHERE title LIKE "%' + search + '%"', function (err, result) {
                if (err) throw err;
                res.render('profile', {data: result});
            });
        } else {
            res.send("Please provide app name");
        }
    }else
        res.render('login')
});

app.post('/submitApp', function (req, res) {

    var appOS = req.body.os;
    var appTitle = req.body.title;
    var appName = req.body.name;
    var appEmail = req.body.email;
    var appPrice = req.body.price;
    var appFund = req.body.fund;
    var appSchool = req.body.school;
    var appCurriculum = req.body.curriculum;
    var appJustification = req.body.justification;
    var appDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    var mail = ['robertrexrode@mgsd.k12.nc.us', appEmail]


    if (appOS != "" && appTitle != "" && appName != "" && appEmail != "" && appPrice != "" && appSchool != ""
        && appCurriculum != "" && appJustification != "" && appDate != "") {
        var sql = `INSERT INTO apprequest (os, title, name, email, price, fund, school, curriculum, justification, date, notes, tested, eula, approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        var inserts = [appOS, appTitle, appName, appEmail, appPrice, appFund, appSchool, appCurriculum, appJustification, appDate, '\n', 'no', 'pending','pending']
        sql = mysql.format(sql, inserts)
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            const mailOptions = {
                from: 'robertrexrode@mgsd.k12.nc.us',
                to: mail,
                subject: 'MGSD Online Application Request Notification',
                text: 'Greetings, this is a notification that an application titled: ' + appTitle + ' has been ' +
                    'submitted for approval by ' + appName + '.' +
                    '\nOperating System: ' + appOS + '\n' +
                    'Applicant Name: ' + appName + '\n' +
                    'Email: ' + appEmail + '\n' +
                    'Free or Paid: ' + appPrice + '\n' +
                    'School: ' + appSchool + '\n' +
                    'Curriculum: ' + appCurriculum + '\n' +
                    'Justification: ' + appJustification + '\n' +
                    'Date: ' + appDate + ''
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
        res.send("Application Form Submitted! Thank You!")
    } else {
        res.send("Please fill in all fields!");
    }
});

app.get('/',(req,res) => {
    res.render('index')
});

app.get('/login',(req,res) => {
    session=req.session;
    if(session.userid){
        res.redirect('/profile')
    }else
        res.render('login')
});

app.get('/profile', (req, res) => {
    session=req.session;
    if(session.userid){
        con.query('SELECT * FROM apprequest', function (err, result) {
            if (err) throw err;
            res.render('profile', {data: result});
        });
    }else {
        res.render('login')
    }

});

app.post('/user', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        var sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
        var inserts = ['user', 'username', username, 'password', password]
        sql = mysql.format(sql, inserts)
        con.query(sql, function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                session=request.session;
                session.userid=request.body.username;
                console.log(request.session)
                response.redirect('/profile')
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`App listening at port ${port}`)
})