
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

module.exports = {
    router
}