const event = require('../../../../utils/event')
const { Language } = require('../../../../models')
const path = require('path')
const cache = require('../../../../utils/cache')
async function chooseLanguage(req, module, body, isCreate = false) {
    if (module === 'languages' && +body.active === 1) {
        await cache.set('lang', body.code)
        if (isCreate) {
            const language = await cache.findOrCreate(
                'langData',
                async () => {
                    const data = await Language.findAll({
                        attributes: ['name', 'code', 'default'],
                        where: {
                            active: true,
                        },
                    })
                    const language = JSON.parse(JSON.stringify(data))
                    return language
                },
                true
            )
            i18n.configure({
                locales: language.map(({ code }) => code),
                cookie: 'lang',
                queryParameter: 'lang',
                directory: path.resolve(__dirname, '../locales'),
            })
            req.app.use(i18n.init)
        }
    }
}
const eventModule = () => {
    event.on('create', async (...args) => {
        const [req, module, item, body] = args
        await chooseLanguage(req, module, body, true)
    })

    event.on('update', async (...args) => {
        const [req, module, id, body] = args
        await chooseLanguage(req, module, body)
    })
}

module.exports = eventModule
