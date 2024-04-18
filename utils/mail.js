const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "roniejisa@gmail.com",
        pass: "xjxg sdef npbi mwvy",
    },
});

module.exports = async (to, subject, message) => {
    const info = await transporter.sendMail({
        from: '"F8 Education" <roniejisa@gmail.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: message, // html body
    });
    return info;
}