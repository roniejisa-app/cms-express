const fs = require('fs')
const { pathPlugin } = require('@utils/all')
const pageController = {
    show: async (req, res, link) => {
        const checkFile = fs.existsSync(
            pathPlugin('pages', 'data', `${link.model_id}.tpl`)
        )
        if (checkFile) {
            const string = fs.readFileSync(
                pathPlugin('pages', 'data', `${link.model_id}.tpl`)
            )
            return res.render(pathPlugin('pages', 'views', 'show'), {
                layout: pathPlugin('pages', 'views', 'layouts/page'),
                html: JSON.parse(string).pagesHtml[0].html,
                css: JSON.parse(string).pagesHtml[0].css,
            })
        }
    },
    customPage: async (req, res) => {
        const { id } = req.params
        res.render('grapes', {
            layout: 'layouts/default',
            id,
        })
    },
}
module.exports = pageController
