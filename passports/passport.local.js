const localStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const { User} = require('@models/index');
module.exports = new localStrategy({
    usernameField: "email",
    passwordField: "password"
}, async (email, password, done) => {
    const user = await User.findOne({
        where: {
            email
        }
    })

    if (!user) {
        return done(null, false, {
            message: "Tài khoản không tồn tại!"
        })
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, {
            message: "Mật khẩu không chính xác"
        })
    }
    return done(null, user);
})