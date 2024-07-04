const express = require('express')
const router = express.Router()
const permissionMiddleware = require('../../../../middlewares/permission.middleware')
const adminMiddleware = require('../../../../middlewares/admin.middleware')
const fakeMiddleware = require('../../../../middlewares/fake.middleware')
const { pathPlugin } = require('../../../../utils/all')
const cache = require('../../../../utils/cache')
const i18n = require('i18n')
const { readJson, writeJson } = require('../../../../utils/write')
var csrf = require('csurf')
var csrfProtect = csrf({ cookie: true })
router.use(fakeMiddleware)
// router.use(permissionMiddleware, adminMiddleware);
router.get('/words', csrfProtect, async (req, res) => {
    const lang = await cache.get('lang')
    const langData = await cache.get('langData')
    req.app.set('layout', 'layouts/admin')
    const words = await readJson(
        '/platform/plugins/i18n/locales/' + lang + '.json'
    )

    res.render(pathPlugin('i18n', 'views', 'index'), {
        req,
        module: 'words',
        name_show: i18n.__('words'),
        words,
        lang,
        langData,
        csrfToken: req.csrfToken(),
    })
})
router.post('/words', csrfProtect, async (req, res) => {
    const { lang } = req.body
    const words = await readJson(
        '/platform/plugins/i18n/locales/' + lang + '.json'
    )

    return res.json({
        status: 200,
        message: 'success',
        data: words,
    })
})

router.patch('/words', csrfProtect, async (req, res) => {
    const { lang, key, value } = req.body
    const words = await readJson(
        '/platform/plugins/i18n/locales/' + lang + '.json'
    )
    words[key] = value
    writeJson('/platform/plugins/i18n/locales/' + lang + '.json', words)
    await cache.set('data-lang-' + lang, words)
    return res.json({
        status: 200,
        message: 'success',
    })
})

module.exports = router
