const router = require('express').Router();
require('dotenv').config()
const bcrypt = require('bcrypt')
const axios = require("axios")
const jwt = require('jsonwebtoken');
const { route } = require('express/lib/application');

const mysql2 = require('mysql2')

const db = mysql2.createPool({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
    connectionLimit: 2
})

// const db = mysql2.createConnection({
//     host: 'localhost',
//     user: 'user',
//     password: 'root',
//     database: 'test'
// });

// db.connect((err) => {
//     if (err) throw error;
//     console.log("Local MySql connected .....")
// })

router.route('/register').post((req, res) => {

    const body = req.body
    let pwd = bcrypt.hashSync(body.password, 10)

    const sqlInsert = `INSERT INTO users(username, password, name, email, age) VALUES ("${body.username}","${pwd}","${body.name}","${body.email}",${body.age});`
    db.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                err: 'error'
            })
        }

        if (result) {
            console.log(result)
            res.status(200).json({
                message: 'succesful insertion'
            })
        }

    })
})

router.route('/login').post((req, res) => {
    const body = req.body
    let sql = `select * from users where username="${body.username}";`

    db.query(sql, (err, resp) => {
        if (err) {
            res.status(401).json({ error: "invalid login credentials" })
        }
        else {


            const user = resp[0]


            const passwordCheck = (user === (null || undefined))
                ? false
                : bcrypt.compareSync(body.password, user.password)

            if (!(user && passwordCheck)) {

                return res.status(401).json({
                    error: 'invalid username or password'
                })
            }

            const userForToken = {
                username: user.username,
                id: user.user_id,
                auth: true

            }
            const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 })
            res.status(200).send(token)
        }
    })


})

module.exports = {
    router,
    db
};