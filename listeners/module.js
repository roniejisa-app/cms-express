const event = require('@utils/event')
const Cache = require('@utils/cache')

function moduleListener() {
    event.on('create', async (...args) => {
        const [req, module, item, body] = args
        if (module === 'modules') {
            await Cache.setMenu(req, true)
        }
    })

    event.on('update', async (...args) => {
        const [req, module, id, body] = args
        if (module === 'modules') {
            await Cache.setMenu(req, true)
        }
    })

    event.on('delete', async (...args) => {
        const [req, module, id] = args
    })
}

module.exports = moduleListener
