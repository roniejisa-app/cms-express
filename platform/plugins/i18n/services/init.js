const i18n = require('i18n')
const { Language, Word } = require('../../../../models/index')
const cache = require('../../../../utils/cache')

const service = async (app) => {
    const data = await cache.findOrCreate('langData', async () => {
        const data = await Language.findAll({
            attributes: ['code'],
            where: {
                active: true,
            },
        })
        const language = JSON.parse(JSON.stringify(data)).map(
            (item) => item.code
        )
        const langData = {}
        for (let i = 0; i < language.length; i++) {
            const words = await Word.findAll({
                where: {
                    code: language[i],
                },
            })
            const wordsData = JSON.parse(JSON.stringify(words))
            const finalData = wordsData.reduce((initial, item) => {
                initial[item.key] = item.value
                return initial
            }, {})
            langData[language[i]] = finalData
        }

        return {
            langData,
            language,
        }
    })
    i18n.configure({
        locales: data.language,
        cookie: 'lang',
        queryParameter: 'lang',
        staticCatalog: data.langData,
    })
    app.use(i18n.init)
}
module.exports = service
