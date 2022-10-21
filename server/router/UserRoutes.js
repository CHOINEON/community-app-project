const express = require('express');
const UserRoutes = express.Router();
const db = require('../dbconnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secret = 'secret123';

UserRoutes.post('/login', (req, res) => {
    const {email, password} = req.body;
    console.log(`email : ${email} \npassword : ${password}`);
    
    db.query('select User_pw from Member where User_id=?', [email], (err, rows) =>{
        if(err) res.status(422).send('something went wrong. Sorry');
        else {
            if(rows.length === 0) {
                res.status(403).send('Username you entered does not exist');
                return;
            }
            const isLoginOk = bcrypt.compareSync(password, rows[0].User_pw);
            isLoginOk && jwt.sign(email, secret, (err, token) => {
                if(err){
                    res.status(403).send();
                }
                else{
                    db.query('update Member set token=? where User_id=?', [token, email], (err, rows) => {
                        if(err) res.status(422).send('something went wrong. Sorry');
                        res.cookie('token', token).send('Login');
                    })
                }
            })
        
            if(!isLoginOk){
                res.status(403).send('Username or password mismatch');
            }
        }
    });
})

UserRoutes.post('/register', (req, res) => {
    const {email,password} = req.body;
    db.query('select * from Member where User_id=?', [email], (err, rows) => {
        if(err) {
            res.status(422).send('something went wrong. Sorry');
        }
        else {
            if(rows.length === 0) {
                const hashedPassword = bcrypt.hashSync(password, 10);
                db.query('insert into Member (User_id, User_pw) values (?,?)', [email, hashedPassword], (err, rows) => {
                    if(err) {
                        console.log(err);
                        res.status(422).send('User creation failed');
                    }
                    else{
                        jwt.sign(email, secret, (err, token) => {
                            if(err) res.sendStatus(403);
                            else {
                                res.cookie('token', token)
                                    .status(201)
                                    .send('User created');
                            }
                        });
                    }
                });
            }
            else {
                res.status(422).send('Email already exists. Please try to login');
            }
        }
    });
})

UserRoutes.post('/logout', (req, res) => {
    res.clearCookie('token').send('Logout');
})

UserRoutes.get('/profile', (req, res) => {
    const token = req.cookies.token;
    jwt.verify(token, secret, (err, data) => {
        if(err){
            res.status(403).send();
        }
        else{
            const qry = 'select User_seq from Member where token=?';
            db.query(qry, [token], (err, rows) => {
                if(err) res.sendStatus(422);
                //console.log(rows[0].User_seq);
                let info = {
                    seq: rows[0].User_seq,
                    email: data
                }
                res.json(info);
            })
        }
    })
})

UserRoutes.post('/getUser', (req, res) => {
    const token = req.cookies.token;
    const qry1 = 'select User_seq from Member where token=?';
    db.query(qry1, [token], (err, rows) => {
        if(err) res.sendStatus(422);
        else{
            let user_seq = rows[0];
            console.log(user_seq);
            res.send(user_seq);
        }
    })
})

module.exports = UserRoutes;