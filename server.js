const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json())


const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'brfz6uddsjfdawqruisq-mysql.services.clever-cloud.com',
        port: 3306,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: 'brfz6uddsjfdawqruisq'
    }
});

const crudRouter = require('./routes/crud');
app.use('/db', crudRouter)


const port = process.env.PORT || 5001
app.listen(port, () => {
    console.log(`server running on ${port} `);
})

module.exports = {
    knex: knex
}
