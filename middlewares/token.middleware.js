const jwt = require('jsonwebtoken')
const { Module } = require('../models/index')
const tokenMiddleware = async (req, res, next) => {
    try {
        const token = req
            .header(process.env.TOKEN_HEADER_KEY)
            .replace('Bearer ', '')
        const jwtSecretKey = process.env.JWT_SECRET
        const verified = jwt.verify(token, jwtSecretKey)
        if (verified) {
            req.verified = verified
            return next()
        }
    } catch (e) {

        // Middleware to allow access only from specific IP address
        const allowOnlyFromIP = (req) => {
            const allowedIP = process.env.DOMAIN_ORIGIN.split(","); // Thay thế bằng địa chỉ IP của VPS của bạn
            const clientIP = req.ip.replace("::ffff:", ""); // Lấy địa chỉ IP của client gửi yêu cầu
            return allowedIP.includes(clientIP);
        };

        // Sử dụng middleware này cho tất cả các route hoặc các route cụ thể
        
        const method = req.method
        const module = req.url.slice(1)
        const count = await Module.count({
            where: {
                name: module,
                public_api: true,
            },
        })
        if (count && method === 'GET' && allowOnlyFromIP(req)) {
            return next()
        }
    }
    return res.status(401).send({
        errors: {
            code: '401',
            message: 'Unauthorized',
        },
    })
}

module.exports = tokenMiddleware
