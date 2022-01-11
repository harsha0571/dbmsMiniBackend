
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


router.route('/recomm').post(async (req, res) => {
    let media = req.body.media_id
    let id = req.id
    let media_type = req.body.media_type
    let api_key = process.env.API_KEY
    let mediaEntry = `SELECT entry_id FROM media WHERE ((viewer_id=${id}) AND (media_id=${media}));`
    var result = {}
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


            let url = `https://api.themoviedb.org/3/${media_type}/${media}/recommendations?api_key=${api_key}&language=en-US&page=1`
            result = await axios.get(url)
            console.log("result here :")
            let data = []
            if (result.data.results.length !== 0) {
                data = result.data.results[0]
            }
            else {
                url = `https://api.themoviedb.org/3/${media_type}/${media}/similar?api_key=${api_key}&language=en-US&page=1`
                console.log("did get executed ")
                console.log("result here 2 :")
                result = await axios.get(url)
                if (result.data.results.length !== 0) {
                    data = result.data.results[0]
                }
                else {
                    console.log("no recome avail")
                    return res.status(401).json({ error: "no recom avaibable" })
                }
            }
            console.log("result:", result.data.results[0])
            // let data = result.data.results[0]

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

    var time = req.body.duration
    var type = req.body.media_type

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
    let profile = `SELECT profile.viewer_name, profile.created_on,profile.movies_wishlisted,profile.shows_wishlisted,total_time.movie_time,total_time.movies_watched,total_time.shows_watched,total_time.tv_time
                    FROM profile
                    INNER JOIN total_time ON (profile.user_id=total_time.user_id AND profile.user_id = ${id});`
    db.query(profile, (err, result) => {
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



module.exports = {
    router
}