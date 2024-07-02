const { User } = require('@models/index')
const sentMail = require('@utils/mail')
const md5 = require('crypto-js/md5')
const bcrypt = require('bcryptjs')
const i18n = require('i18n')
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
            req.flash(
                'msgError',
                i18n.__('does_not_exist', { name: i18n.__('account') })
            )
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
            i18n.__('recover', { name: i18n.__('password') }),
            `<a href="${link}">${i18n.__('recover', { name: i18n.__('password') })}</a>`
        )

        if (!checkSendMail) {
            req.flash('msgError', i18n.__('please_resend'))
            return res.redirect('/lost-password')
        }

        req.flash('msgSuccess', i18n.__('sent_email_recover_success', { name: i18n.__('password') }))

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
            req.flash('msgError', i18n.__('does_not_exist', { name: i18n.__('verify_code') }))
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
            req.flash('msgError', i18n.__('does_not_exist', { name: i18n.__('verify_code') }))
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

        req.flash('success', i18n.__('update_success', { name: i18n.__('password') }))
        return res.redirect('/login')
    },
}