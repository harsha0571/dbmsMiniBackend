const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')

require('dotenv').config()
app.use(cors())
app.use(express.json())
// app.use('^/$', function (req, res, next) {

//     res.sendFile(path.join(__dirname, 'build', 'index.html'));

//     next()
// });
app.use(express.static('build'))
const middleware = require('./middleware/utils')
const crudRouter = require('./routes/crud');
const apiRouter = require('./routes/api');

app.use(middleware.tokenExtractor)
app.use('/db', crudRouter.router)
app.use('/db', middleware.userExtractor, apiRouter.router)
app.get('/test', (req, res) => {
    res.status(200).json({ works: "it does" })
})
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const port = process.env.PORT || 5001
app.listen(port, () => {
    console.log(`server running on ${port} `);
})



