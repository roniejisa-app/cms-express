const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

module.exports = async (to, subject, message) => {
    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: message, // html body
    })
    return info
}
