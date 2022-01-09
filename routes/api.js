
const router = require('express').Router();
const crud = require('./crud')
const db = crud.db
const bcrypt = require('bcrypt')
const axios = require("axios")
const jwt = require('jsonwebtoken');

router.route("/add/:s").get((req, res) => {

    let id = req.id

    let s = req.params.s

    let status
    if (s === "1") {
        status = 'watchlist'
    }
    else {
        status = 'watched'
    }

    let sql = `SELECT * FROM media WHERE (viewer_id=${id} AND status="${status}")`

    db.query(sql, (err, result) => {
        if (err) {
            res.status(401).json({ error: "error" })
        }
        else {
            res.status(200).json(result)
        }
    })

})

// https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key=<<api_key>>&language=en-US&page=1
//https://api.themoviedb.org/3/tv/{tv_id}/recommendations?api_key=<<api_key>>&language=en-US&page=1

router.route('/recomm').post((req, res) => {
    let media = req.body.media_id
    let id = req.id
    let media_type = req.body.media_type
    let api_key = process.env.API_KEY
    let eid = req.body.entry_id
    var result
    var data
    //   id: 1893,
    //   media_type: 'movie',
    //   title: 'Star Wars: Episode I - The Phantom Menace',
    //   original_title: 'Star Wars: Episode I - The Phantom Menace',
    //   overview: 'Anakin Skywalker, a young slave strong with the Force, is discovered on Tatooine. Meanwhile, the evil Sith have returned, enacting their plot for revenge against the Jedi.',

    async function getRecomms() {
        try {
            result = await axios.get(`https://api.themoviedb.org/3/${media_type}/${media}/recommendations?api_key=${api_key}&language=en-US&page=1`)
            let data = result.data.results[0]
            console.log(data)
            let sql = `INSERT INTO recommendation VALUES (${id}, ${media}, ${data.id}, "${data.title}",${eid});`
            db.query(sql, (er, rs) => {
                if (er) {
                    console.log(er)
                    return res.status(401).json({ msg: "insertion into recomm failed" })
                }
                else {
                    res.status(400).json(rs)
                }
            })
        }
        catch (error) {
            console.log(error)
            return res.status(401).json({ msg: "axios api call failed" })
        }
    }
    getRecomms()
})

router.route('/profile').get((req, res) => {
    let id = req.id
    let sql = `SELECT * FROM profile WHERE user_id = ${id}`
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

router.route('/total').get((req, res) => {
    let sql = "SELECT * FROM total_tim"
    let flag = false
    db.query(sql, (err, result) => {
        if (err) {
            res.status(401).json({ err: "not reachable total_time" })
            flag = true
            return
        }
        console.log("test failed ")
        res.status(200).json(result)
    })
    if (flag) console.log("came from error")
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
                    let month = (date.getMonth() + 1).toString()
                    let day = (date.getDate()).toString()
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
                    db.query(total_time, (ert, rst) => {
                        if (ert) {
                            console.log(ert)

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

module.exports = {
    router
}