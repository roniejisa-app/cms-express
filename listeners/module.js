const event = require("@utils/event");
const Cache = require("@utils/cache");
const i18n = require("i18n");
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
        if(module === 'words') {
            const data = await Cache.get('langData');
            if(data.langData[body.code] && data.langData[body.code][body.key]) {
                data.langData[body.code][body.key] = body.value;
                i18n.configure({
                    locales: data.language,
                    cookie: 'lang',
                    queryParameter: 'lang',
                    staticCatalog: data.langData,
                });
                req.app.use(i18n.init);
            }
        }
    })

    event.on('delete', async (...args) => {
        const [req, module, id] = args;
    })
}

module.exports = moduleListener;