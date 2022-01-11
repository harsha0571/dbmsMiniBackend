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
            let getUser = `SELECT * FROM users WHERE username="${body.username}";`
            let user
            db.query(getUser, (er, rs) => {
                if (er) {

                    return res.status(401).json({ err: "user does'nt exist " })
                }
                else {

                    user = rs[0]
                    let date = new Date()
                    let year = date.getFullYear().toString()
                    let month = (date.getMonth() + 1).toString()
                    let day = (date.getDate()).toString()
                    let d = year + "-" + month + "-" + day

                    let profile = `INSERT INTO profile (user_id , viewer_name , created_on) VALUES ("${user.user_id}","${user.username}","${d}");`

                    db.query(profile, (erp, rsp) => {
                        if (erp) {
                            console.log(erp)
                            return res.status(401).json({ err: "profile entry not made " })
                        }
                        else {
                            console.log(rsp)
                        }
                    })

                    let total_time = `INSERT INTO total_time (user_id) VALUES ("${user.user_id}")`
                    db.query(total_time, (ert, rst) => {
                        if (ert) {
                            console.log(ert)
                            return res.status(401).json({ err: "total time  entry not made " })
                        }
                        else {
                            console.log(rst)
                        }
                    })
                }
            })

            // console.log(user.user_id)

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
            const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })
            res.status(200).send(token)
        }
    })

})

// entry_id int AI PK 
// title varchar(100) 
// imgurl varchar(50) 
// media_type varchar(10) 
// media_id int 
// viewer_id int 
// duration int 
// time date 
// status varchar(10)

router.route('/add').post((req, res) => {
    const body = req.body
    let sql = `INSERT INTO media (title ,imgurl ,media_type , media_id, viewer_id, duration, time, status)VALUES 
    ("${body.title}","${body.imgurl}","${body.media_type}",${body.media_id},${body.viewer_id},${body.duration},"${body.time}","${body.status}");`

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({ error: "error" })
        }
        else {
            res.status(200).json({ message: "add successful" })
        }
    })


})



module.exports = {
    router,
    db
};