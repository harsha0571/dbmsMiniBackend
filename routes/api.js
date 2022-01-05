
const router = require('express').Router();
const crud = require('./crud')
const db = crud.db
const bcrypt = require('bcrypt')
const axios = require("axios")
const jwt = require('jsonwebtoken');


router.route('/tester').get((req, res) => {
    let sql = `select * from users;
               select name from users;
               `
    db.query(sql, (err, resp) => {
        if (err) res.status(401).json({ error: "did'nt work" })
        res.status(200).json(resp)
    })

})


router.route('/regUser').post((req, res) => {

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
            let getUser = `SELECT * FROM users WHERE username="${body.username}"`
            var user
            db.query(getUser, (er, rs) => {
                if (err) res.status(401).json({ err: "user does'nt exist " })
                else {
                    user = rs[0]
                    console.log(user)
                    console.log(user.user_id)
                }
            })
            let date = Date.now()
            console.log("date now :", date)
            // console.log(user.user_id)
            // let sql = `INSERT INTO profile (user_id , viewer_name , created_on) VALUES ("${user.user_id}","${user.name}",,)`
            res.status(200).json({
                message: 'succesful insertion'
            })
        }

    })
})

module.exports = {
    router
}