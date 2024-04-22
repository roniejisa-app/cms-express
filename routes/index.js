var express = require('express');
var router = express.Router();
var sendMail = require('../utils/mail');
const {chatRoom} = require('../models/index');
/* GET home page. */
router.use(function (req, res, next) {
    req.app.set('layout', 'layouts/layout');
    next();
})

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express', req });
});
router.get('/test',async function (req, res, next) {
    const roomChat = await chatRoom.findByPk(1);
    console.log(roomChat);
    res.render('test');
})
router.get('/send-mail', async (req, res) => {
    const info = await sendMail(
        "hieupm248@gmail.com",
        "Hello World",
        "<h1>Hello world</h1>"
    )
    return res.json(info);
})

module.exports = router;
