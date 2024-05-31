var express = require('express');
const authController = require('@controllers/auth.controller');
const passport = require('passport');
var router = express.Router();

router.get("/login", authController.login);
router.post('/login', passport.authenticate('local', {
    failureRedirect: "/login",
    failureFlash: true,
    badRequestMessage: "Vui lòng nhập Email và Password",
    successRedirect: "/",
}), (req, res) => {
    return res.json({
        status: "success",
        user: req.user
    })
})

router.get('/lost-password', authController.lostPassword);
router.post('/lost-password', authController.handleResetPassword);

router.get('/reset-password', authController.resetPassword);
router.post('/reset-password', authController.handleResetPasswordNow);

router.get('/google/redirect', passport.authenticate('google'));
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    badRequestMessage: "Xác thực không thành công",
    failureFlash: true,
    successRedirect: "/",
}), (req, res) => {
    return res.json({
        status: "success",
        user: req.user
    })
})

router.post('/logout', (req, res) => {
    req.logout((err) => {})
    return res.redirect('/login');
})
module.exports = router