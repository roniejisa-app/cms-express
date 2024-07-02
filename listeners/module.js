const event = require('@utils/event')
const Cache = require('@utils/cache')
const i18n = require('i18n')
const cache = require('../utils/cache')
const { Language } = require('../models')
async function chooseLanguage(req, module, body, isCreate = false) {
    if (module === 'languages' && +body.active === 1) {
        await cache.set('lang', body.code)
        if (isCreate) {
            const language = await cache.findOrCreate('langData', async () => {
                const data = await Language.findAll(
                    {
                        attributes: ['code', 'default'],
                        where: {
                            active: true,
                        },
                    },
                    true
                )
                const language = JSON.parse(JSON.stringify(data)).map(
                    (item) => item.code
                )
                return language
            },true)
            i18n.configure({
                locales: language,
                cookie: 'lang',
                queryParameter: 'lang',
                directory: path.join(__dirname, 'locales'),
            })
            req.app.use(i18n.init)
        }
    }
}
function moduleListener() {
    event.on('create', async (...args) => {
        const [req, module, item, body] = args
        if (module === 'modules') {
            await Cache.setMenu(req, true)
        }

        await chooseLanguage(req, module, body, true)
    })

    event.on('update', async (...args) => {
        const [req, module, id, body] = args
        if (module === 'modules') {
            await Cache.setMenu(req, true)
        }
        await chooseLanguage(req, module, body)
    })

    event.on('delete', async (...args) => {
        const [req, module, id] = args
    })
}

module.exports = moduleListener
