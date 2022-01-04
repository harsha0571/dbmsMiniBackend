const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config()
app.use(cors())
app.use(express.json())

const middleware = require('./middleware/utils')
const crudRouter = require('./routes/crud');
const testRouter = require('./routes/test');

app.use(middleware.tokenExtractor)
app.use('/db', crudRouter.router)
app.use('/db', testRouter.router)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const port = process.env.PORT || 5001
app.listen(port, () => {
    console.log(`server running on ${port} `);
})



