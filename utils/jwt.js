const jwt = require('jsonwebtoken')
const crypto = require('crypto')
function createToken(user) {
    const payload = {
        fullname: user.fullname,
        id: user.id,
    }

    const secret = process.env.JWT_SECRET // Đảm bảo rằng secret được lưu trữ an toàn trong biến môi trường
    const options = {
        expiresIn: process.env.JWT_TOKEN_LIFE_TIME, // Thời gian hết hạn của token chỉ áp dụng từ giây
    }

    return jwt.sign(payload, secret, options)
}

function createRefreshToken(user) {
    const payload = {
        fullname: user.fullname,
    }

    const secret = process.env.REFRESH_TOKEN_SECRET
    const options = {
        expiresIn: process.env.JWT_REFRESH_TOKEN_LIFE_TIME, // Thời gian hết hạn của refresh token chỉ áp dụng với giây
    }
    return jwt.sign(payload, secret, options)
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}
module.exports = {
    createToken,
    createRefreshToken,
    hashToken,
}
