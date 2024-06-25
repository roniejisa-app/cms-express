const { User } = require('@models/index')
const sentMail = require('@utils/mail')
const md5 = require('crypto-js/md5')
const bcrypt = require('bcryptjs')
module.exports = {
    login: (req, res) => {
        if (req.user) {
            return res.redirect('/')
        }
        const error = req.flash('error')
        const success = req.flash('success')
        res.render('auth/login', {
            layout: 'layouts/auth',
            error,
            success,
        })
    },
    lostPassword: (req, res) => {
        const msgError = req.flash('msgError')
        const msgSuccess = req.flash('msgSuccess')

        res.render('auth/lost-password', {
            layout: 'layouts/auth',
            msgError,
            msgSuccess,
        })
    },
    handleResetPassword: async (req, res) => {
        const { email } = req.body
        const user = await User.findOne({
            where: {
                email,
            },
        })

        if (!user) {
            req.flash('msgError', 'Tài khoản này không tồn tại!')
            return res.redirect('/lost-password')
        }

        const token = md5(`${user.email}${new Date().getTime()}`).toString()
        await User.update(
            {
                reset_token: token,
            },
            {
                where: {
                    email,
                },
            }
        )

        const link = process.env.BASE_URL + `/reset-password?token=${token}`

        const checkSendMail = await sentMail(
            user.email,
            'Lấy lại mật khẩu',
            `<a href="${link}">Lấy lại mật khẩu</a>`
        )

        if (!checkSendMail) {
            req.flash('msgError', 'Vui lòng gửi lại sau giây lát!')
            return res.redirect('/lost-password')
        }

        req.flash('msgSuccess', 'Gửi mail lấy lại mật khẩu thành công!')

        return res.redirect('/lost-password')
    },
    resetPassword: async (req, res) => {
        const { token } = req.query
        var user = await User.findOne({
            where: {
                reset_token: token,
            },
        })
        if (!user) {
            req.flash('msgError', 'Mã xác nhận không tồn tại vui lòng thử lại!')
            return res.redirect('/lost-password')
        }
        return res.render('auth/reset-password', {
            layout: 'layouts/auth',
            token,
        })
    },
    handleResetPasswordNow: async (req, res) => {
        const { token, password } = req.body
        var user = await User.findOne({
            where: {
                reset_token: token,
            },
        })

        if (!user) {
            req.flash('msgError', 'Mã xác nhận không tồn tại vui lòng thử lại!')
            return res.redirect('/lost-password')
        }
        const saltRounds = await bcrypt.genSalt(10)
        const passwordBcrypt = await bcrypt.hash(password, saltRounds)
        await User.update(
            {
                password: passwordBcrypt,
                reset_token: null,
            },
            {
                where: {
                    id: user.id,
                },
            }
        )

        req.flash('success', 'Đổi mật khẩu thành công vui lòng đăng nhập!')
        return res.redirect('/login')
    },
}
