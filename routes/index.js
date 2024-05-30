var express = require('express')
var router = express.Router()
var sendMail = require('../utils/mail')
const db = require('../mongodb/model')
/* GET home page. */
router.use(function (req, res, next) {
    req.app.set('layout', 'layouts/layout')
    next()
})

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express', req })
})

router.get('/test', async function (req, res, next) {
    res.render('test')
})

router.get('/send-mail', async (req, res) => {
    const info = await sendMail(
        'hieupm248@gmail.com',
        'Hello World',
        '<h1>Hello world</h1>'
    )
    return res.json(info)
})

router.get('/posts', async (req, res) => {
    const data = new db.Post({
        name: 'hehe',
        content: 'lorem ipsum dolor sit amet',
    })
    await data.save()
    return res.status(200).json(data)
})
module.exports = router
