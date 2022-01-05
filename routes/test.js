
const router = require('express').Router();
const crud = require('./crud')
const db = crud.db



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
            console.log(result)
            res.status(200).json({
                message: 'succesful insertion'
            })
        }

    })
})

module.exports = {
    router
}