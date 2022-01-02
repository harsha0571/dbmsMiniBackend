const router = require('express').Router();
require('dotenv').config()
const mysql2 = require('mysql2')
const bcrypt = require('bcrypt')
const db = mysql2.createConnection(process.env.DATABASE_URL)
const axios = require("axios")
const jwt = require('jsonwebtoken');
const { route } = require('express/lib/application');

db.connect((err) => {
    if (err) throw err;
    console.log("MySql connected .... ")
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

    let sql = `insert into users (username , password , name , email,age ) values("${body.username}","${pwd}","${body.name}","${body.email}",${body.age});`

    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)
    })
})

router.route('/login').post((req, res) => {
    const body = req.body
    let sql = `select * from users where username="${body.username}";`

    db.query(sql, (err, resp) => {
        if (err) throw err;
        const user = resp[0]


        const passwordCheck = (user === null)
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

    })


})

// sername varchar(20),
// password varchar(100),
// name varchar(20),
// email varchar(30),
// age int,
// unique(username),
// user_id int auto_increment primary key
router.route('/jwt/:name').get((req, res) => {

    const name = req.params.name
    const userForToken = {
        id: name
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    res.status(200).send({ token, name: name })

})

router.route('/axios/:id').get(async (req, res) => {
    try {
        const resp = await axios.get(`https://jsonplaceholder.typicode.com/todos/${req.params.id}`)
        // const resp = await axios.get("http://localhost:5001/db/test")
        res.status(200).json(resp.data);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
})




router.route('/test').get((req, res) => {

    let sql = 'SELECT * FROM users'
    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)
        // console.log(resp)

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

    let sql = `UPDATE TEST SET PHNO = ${req.body.phno} WHERE NAME = '${req.body.name}'`
    db.query(sql, (err, resp) => {
        if (err) throw err;
        res.json(resp)
    })

});

router.route('/test').delete((req, res) => {

    let sql = `DELETE FROM TEST WHERE name='${req.body.name}'`
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