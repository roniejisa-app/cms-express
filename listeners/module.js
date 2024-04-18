const event = require("../utils/event");
const Cache = require("../utils/cache");
function moduleListener() {
    event.on('create', async (...args) => {
        const [req, module, id, item, body] = args;
        if (module === 'modules') {
            await Cache.setMenu(req, true);
        }
    })

    event.on('update', async (...args) => {
        const [req, module, id, body ] = args;
        if (module === 'modules') {
            await Cache.setMenu(req, true);
        }
    })

    event.on('delete', async (...args) => {
        const [req, module, id] = args;
        console.log(new Date().getSeconds());
    })
}

module.exports = moduleListener;