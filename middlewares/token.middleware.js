const jwt = require('jsonwebtoken')

const tokenMiddleware = (req, res, next) => {
    try {
        const token = req
            .header(process.env.TOKEN_HEADER_KEY)
            .replace('Bearer ', '')
        const jwtSecretKey = process.env.JWT_SECRET
        const verified = jwt.verify(token, jwtSecretKey)
        if (verified) {
            req.verified = verified
            return next()
        } else {
            return res.status(401).send({
                errors: {
                    code: '401',
                    message: 'Unauthorized',
                },
            })
        }
    } catch (e) {
        return res.status(401).send({
            errors: {
                code: '401',
                message: 'Unauthorized',
            },
        })
    }
}

module.exports = tokenMiddleware
