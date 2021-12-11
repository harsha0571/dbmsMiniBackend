const router = require('express').Router();
require('dotenv').config()
const mysql2 = require('mysql2')


const db = mysql2.createConnection(process.env.DATABASE_URL)

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("MySql connected .... ")
})
router.route('/test').get((req, res) => {

    let sql = 'SELECT * FROM TEST'
    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)

    })

});
router.route('/test').post((req, res) => {
    let details = { name: req.body.name, phno: req.body.phno }
    let sql = `INSERT INTO TEST SET ?`
    db.query(sql, details, (err, resp) => {
        if (err) throw err;
        res.json(resp)

    })

});

router.route('/test').put((req, res) => {

    let sql = `UPDATE TEST SET PHNO = ${req.body.phno} WHERE NAME = \'${req.body.name}\'`
    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)
    })

});

router.route('/test').delete((req, res) => {

    let sql = `DELETE FROM TEST WHERE name=\'${req.body.name}\'`
    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)

    })

});



// var knex = require('knex')({
//     client: 'mysql2',
//     connection: process.env.DATABASE_URL,
//     searchPath: 'knex,public',
//     pool: { min: 0, max: 7 }
// })

// router.route('/').get((req, res) => {

//     knex('TEST').where({}).then(rows => res.json(rows))
//         .catch(err => res.status(400).json("error: " + err))

// });

// router.route('/').post((req, res) => {

//     knex('TEST').insert({ name: req.body.name, phno: req.body.phno })
//         .then(resp => res.json("insertion successful"))
//         .catch(err => res.status(400).json("error:" + err))

// });

// router.route('/').put((req, res) => {
//     knex('TEST').where({ name: req.body.name }).update({ phno: req.body.phno })
//         .then(resp => res.json("updation sucessful"))
//         .catch(err => res.status(400).json("error:" + err))
// });

// router.route('/').delete((req, res) => {
//     knex('TEST').where({ name: req.body.name }).del()
//         .then(resp => res.json("deletion sucessful"))
//         .catch(err => res.status(400).json("error:" + err))
// });




module.exports = router;