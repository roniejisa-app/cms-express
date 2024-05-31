var express = require('express')
const apiController = require('../../controllers/api/api.controller')
const authRouter = require('./auth')
const authLoggedRouter = require('./authLogged')
var router = express.Router()
const tokenMiddleware = require('../../middlewares/token.middleware')

router.use('/auth', authRouter)
router.all('*', tokenMiddleware)
router.use('/auth', authLoggedRouter)
router.get('/:module', apiController.all)
router.get('/:module/:id', apiController.one)
router.post('/:module', apiController.create)
router.patch('/:module/:id', apiController.update)
router.put('/:module/:id', apiController.update)
router.delete('/:module/:id', apiController.delete)
router.all('/*', (req, res) => {
    res.status(404).json({
        errors: {
            code: '404',
            message: 'Không tìm thấy API',
        },
    })
})
module.exports = router
