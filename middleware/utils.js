
const jwt = require('jsonwebtoken')
const crud = require('../routes/crud')
const db = crud.db

const errorHandler = (error, request, response, next) => {


    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {

    const getTokenFrom = request => {
        const authorization = request.get('authorization')
        if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
            return authorization.substring(7)
        }
        return null
    }

    request.token = getTokenFrom(request)
    next()
}

const userExtractor = async (req, res, next) => {
    const token = req.token
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }
    let id = decodedToken.id
    let sql = `SELECT user_id FROM users WHERE user_id=${id}`
    db.query(sql, (err, res) => {
        id = res[0].user_id

    })
    if (id) {
        req.id = id
    }
    else {
        return res.status(401).json({ error: 'user not in database' })
    }
    next()
}


module.exports = {

    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor

}