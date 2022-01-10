
const router = require('express').Router();
const crud = require('./crud')
const db = crud.db
const bcrypt = require('bcrypt')
const axios = require("axios")
const jwt = require('jsonwebtoken');
const { reset } = require('nodemon');


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

router.route('/recomm').post(async (req, res) => {
    let media = req.body.media_id
    let id = req.id
    let media_type = req.body.media_type
    let api_key = process.env.API_KEY
    let mediaEntry = `SELECT entry_id FROM media WHERE ((viewer_id=${id}) AND (media_id=${media}));`
    var result
    var entryId = 0
    function getEntry() {
        db.query(mediaEntry, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(401).json({ msg: "no entry in media" })
            }
            else {
                entryId = result[0].entry_id
                getRecomms()
            }
        })
    }
    getEntry()
    async function getRecomms() {
        try {


            let url = ""
            if (media_type === "movie") {
                url = `https://api.themoviedb.org/3/${media_type}/${media}/recommendations?api_key=${api_key}&language=en-US&page=1`
            }
            else if (media_type === "tv") {
                url = `https://api.themoviedb.org/3/${media_type}/${media}/similar?api_key=${api_key}&language=en-US&page=1`
            }


            result = await axios.get(url)
            let data = result.data.results[0]

            let title = (data.title) ? data.title : data.name
            title = (title) ? title : title.orignal_title
            title = (title) ? title : title.orignal_name



            let sql = `INSERT INTO recommendation VALUES (${id}, ${media},"${media_type}",${data.id}, "${title}",${entryId});`
            db.query(sql, (er, rs) => {
                if (er) {
                    console.log(er)
                    return res.status(401).json({ msg: "insertion into recomm failed" })
                }
                else {
                    res.status(200).json(rs)
                }
            })
        }
        catch (error) {
            console.log(error)
            return res.status(401).json({ msg: "axios api call failed" })
        }
    }

})

router.route('/recomm').get(async (req, res) => {

    let id = req.id
    let sql = `SELECT * FROM recommendation WHERE viewer_id=${id};`

    db.query(sql, (error, result) => {
        if (error) {
            return res.status(401).json({ err: "no recommendation for this user" })
        }
        else {
            return res.status(200).json(result)
        }
    })
})

router.route('/duration').put((req, res) => {
    var id = req.id
    console.log(req.body)
    var time = req.body.duration
    var type = req.body.media_type
    console.log("tyep ot", type)
    var user = `SELECT * FROM total_time WHERE user_id=${id};`
    db.query(user, (error, result) => {
        if (error) {
            console.log(error)
            return res.status(400).json({ error: "user doesn't exist " })
        }
        else {

            var typeT = `${type}_time`
            var typeW = ""

            var presT = 0
            var presW = 0
            if (type === "tv") {
                presT = result[0].tv_time + time
                presW = result[0].shows_watched + 1
                typeW = "shows_watched"
            }
            else if (type === "movie") {
                presT = result[0].movie_time + time
                presW = result[0].movies_watched + 1
                typeW = "movies_watched"
            }

            var update = `UPDATE total_time SET ${typeT} = ${presT} ,${typeW}=${presW} WHERE user_id = ${id}; `
            db.query(update, (er, rs) => {
                if (er) {
                    console.log(er)
                    return res.status(400).json({ error: "update time failed" })
                }
                else {
                    return res.status(200).json(rs)
                }
            })
        }

    })
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

router.route('/profile').put((req, res) => {
    let id = req.id
    let type = req.body.media_type
    var user = `SELECT * FROM profile WHERE user_id=${id};`
    db.query(user, (error, result) => {
        if (error) {
            console.log(error)
            return res.status(400).json({ error: "user doesn't exist " })
        }
        else {
            let typeT
            let presT
            if (type === "tv") {
                typeT = "shows_wishlisted"
                presT = result[0].shows_wishlisted + 1
            }
            else if (type === "movie") {
                typeT = "movies_wishlisted"
                presT = result[0].movies_wishlisted + 1
            }

            var update = `UPDATE profile SET ${typeT} = ${presT} WHERE user_id = ${id}; `
            db.query(update, (er, rs) => {
                if (er) {
                    console.log(er)
                    return res.status(400).json({ error: "update profile failed" })
                }
                else {
                    return res.status(200).json(rs)
                }
            })
        }

    })
})

router.route('/total_time').get((req, res) => {
    let id = req.id
    let sql = `SELECT * FROM total_time WHERE user_id=${id}`
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