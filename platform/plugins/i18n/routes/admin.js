const express = require('express')
const router = express.Router()
const permissionMiddleware = require('../../../../middlewares/permission.middleware')
const adminMiddleware = require('../../../../middlewares/admin.middleware')
const fakeMiddleware = require('../../../../middlewares/fake.middleware')
const { pathPlugin } = require('../../../../utils/all')
// router.use(fakeMiddleware)
router.use(permissionMiddleware, adminMiddleware);
router.get('/words', async (req, res) => {
    req.app.set('layout', 'layouts/admin')
    res.render(pathPlugin('i18n', 'views', 'index'), {
        req,
    })
})
module.exports = router