const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json())




const crudRouter = require('./routes/crud');
app.use('/db', crudRouter)


const port = process.env.PORT || 5001
app.listen(port, () => {
    console.log(`server running on ${port} `);
})


