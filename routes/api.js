var express = require('express')
const apiController = require('../controllers/api/api.controller')
var router = express.Router()
// router.get('/v1/users', userController.index)
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
