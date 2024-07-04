const i18n = require('i18n')
const { Language } = require('../../../../models/index')
const cache = require('../../../../utils/cache')
const path = require('path')
const service = async (app) => {
    const language = await cache.findOrCreate('langData', async () => {
        const data = await Language.findAll(
            {
                attributes: ['name', 'code', 'default'],
                where: {
                    active: true,
                },
            },
            true
        )
        const language = JSON.parse(JSON.stringify(data))
        return language
    })

    i18n.configure({
        locales: language.map(({ code }) => code),
        cookie: 'lang',
        queryParameter: 'lang',
        directory: path.resolve(__dirname, '../locales'),
    })
    app.use(i18n.init)
}
module.exports = service
