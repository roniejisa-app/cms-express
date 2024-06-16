var express = require('express')
var router = express.Router()
var sendMail = require('@utils/mail')
const { Module, ManagerModule } = require('@models/index')
/* GET home page. */
router.use(function (req, res, next) {
    req.app.set('layout', 'layouts/layout')
    next()
})

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express', req })
})

router.get('/test', async function (req, res, next) {
    // let data = await Module.findAll({
    //     include: [
    //         {
    //             model: ManagerModule,
    //             as: 'managerModule',
    //         },
    //     ],
    // })
    // const arr = Array.from(data).map((i) => {
    //     return {
    //         ...i.dataValues,
    //         managerModule: i.managerModule
    //             ? { ...i.managerModule.dataValues }
    //             : null,
    //     }
    // })
    const pathToFolder = process.cwd() + process.env.FOLDER_UPLOAD_SERVER
    res.status(200).json({ message: pathToFolder })
})
// Test gửi mail
router.get('/send-mail', async (req, res) => {
    const info = await sendMail(
        'hieupm248@gmail.com',
        'Hello World',
        '<h1>Hello world</h1>'
    )
    return res.json(info)
})
module.exports = router
