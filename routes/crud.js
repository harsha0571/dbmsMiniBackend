const router = require('express').Router();
require('dotenv').config()

// const knex = require('knex')({
//     client: 'mysql2',
//     connection: {
//         host: 'brfz6uddsjfdawqruisq-mysql.services.clever-cloud.com',
//         port: 3306,
//         user: process.env.USERNAME,
//         password: process.env.MYSQL_ADDON_PASSWORD,
//         database: 'brfz6uddsjfdawqruisq'
//     }
// });

var knex = require('knex')({
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    searchPath: 'knex,public',
    pool: { min: 0, max: 7 }
})

router.route('/').get((req, res) => {

    knex('TEST').where({}).then(rows => res.json(rows))
        .catch(err => res.status(400).json("error: " + err))

});

router.route('/').post((req, res) => {

    knex('TEST').insert({ name: req.body.name, phno: req.body.phno })
        .then(resp => res.json("insertion successful"))
        .catch(err => res.status(400).json("error:" + err))

});

router.route('/').put((req, res) => {
    knex('TEST').where({ name: req.body.name }).update({ phno: req.body.phno })
        .then(resp => res.json("updation sucessful"))
        .catch(err => res.status(400).json("error:" + err))
});

router.route('/').delete((req, res) => {
    knex('TEST').where({ name: req.body.name }).del()
        .then(resp => res.json("deletion sucessful"))
        .catch(err => res.status(400).json("error:" + err))
});




module.exports = router;