
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
router.route('/profile').get((req, res) => {
    let sql = "SELECT * FROM profile"
    db.query(sql, (err, result) => {
        if (err) res.status(401).json({ err: "not reachable profile" })
        else {
            res.status(200).json(result)
        }
    })
})

router.route('/total_time').get((req, res) => {
    let sql = "SELECT * FROM total_time"
    db.query(sql, (err, result) => {
        if (err) res.status(401).json({ err: "not reachable total_time" })
        else {
            res.status(200).json(result)
        }
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
            let getUser = `SELECT * FROM users WHERE username="${body.username}";`
            let user
            db.query(getUser, (er, rs) => {
                if (er) {
                    console.log(er)
                    // res.status(401).json({ err: "user does'nt exist " }) 
                }
                else {

                    user = rs[0]
                    let date = new Date()
                    let year = date.getFullYear().toString()
                    let month = date.getMonth().toString()
                    let day = (date.getDate() + 1).toString()
                    let d = year + "-" + month + "-" + day

                    let profile = `INSERT INTO profile (user_id , viewer_name , created_on) VALUES ("${user.user_id}","${user.username}","${d}");`

                    db.query(profile, (erp, rsp) => {
                        if (erp) {
                            console.log(erp)
                            // res.status(401).json({ err: "profile entry not made " })
                        }
                        else {
                            console.log(rsp)
                        }
                    })

                    let total_time = `INSERT INTO total_time (user_id) VALUES ("${user.user_id}")`

                }
            })

            // console.log(user.user_id)

            res.status(200).json({
                message: 'succesful insertion'
            })
        }

    })
})

module.exports = {
    router
}