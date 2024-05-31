const express = require('express')
const { existsSync } = require('fs')
const { Link } = require('@models/index')
const { isObject } = require('@utils/all')
const router = express.Router()
// Sử dụng cho mục đích slug 1 level
router.get(/^\/(?!admin|grapes|api|crawler).*$/, async (req, res, next) => {
    const url = req.url.slice(1)
    const dataModule = await Link.findOne({
        where: {
            url,
        },
    })
    if (dataModule && dataModule.method && dataModule.controller) {
        const pathController = process.cwd() + dataModule.controller
        if (!existsSync(pathController)) res.status(404)
        const controller = require(pathController);
        if (isObject(controller) && typeof controller[dataModule.method] === "function") {
            return controller[dataModule.method](req, res, dataModule)
        }
        res.status(404).send('<h1>Not found</h1>')
    }
    next()
})

module.exports = router
