const { getDataApi } = require('@utils/dataTable')
const SQLController = require('./module/sql.controller')
const NoSqlController = require('./module/no_sql.controller')
const { logError } = require('../../utils/write')
const controllers = {
    SQL: {
        all: (req, res, params) => SQLController.all(req, res, params),
        one: (req, res, params) => SQLController.one(req, res, params),
        create: (req, res, params) => SQLController.create(req, res, params),
        update: (req, res, params) => SQLController.update(req, res, params),
        delete: (req, res, params) => SQLController.delete(req, res, params),
    },
    NOSQL: {
        all: (req, res, params) => NoSqlController.all(req, res, params),
        one: (req, res, params) => NoSqlController.one(req, res, params),
        create: (req, res, params) => NoSqlController.create(req, res, params),
        update: (req, res, params) => NoSqlController.update(req, res, params),
        delete: (req, res, params) => NoSqlController.delete(req, res, params),
    },
}
const apiController = {
    all: async (req, res, next) => {
        // try {
        const { type, ...params } = await getDataApi(req)

        return controllers[type.toUpperCase()].all(req, res, params)

        // } catch (e) {
        //     return next()
        // }
    },
    one: async (req, res, next) => {
        try {
            const { type, ...params } = await getDataApi(req)
            return controllers[type.toUpperCase()].one(req, res, params)
        } catch (e) {
            logError('error api one ' + e)
            next()
        }
    },
    create: async (req, res, next) => {
        try {
            const { type, ...params } = await getDataApi(req)
            return controllers[type.toUpperCase()].create(req, res, params)
        } catch (e) {
            logError('error api create ' + e)
            next()
        }
    },
    update: async (req, res, next) => {
        try {
            const { type, ...params } = await getDataApi(req)
            return controllers[type.toUpperCase()].update(req, res, params)
        } catch (e) {
            logError('error api update' + e)
            next()
        }
    },
    delete: async (req, res, next) => {
        try {
            const { type, ...params } = await getDataApi(req)
            return controllers[type.toUpperCase()].delete(req, res, params)
        } catch (e) {
            logError('error api delete ' + e)
            next()
        }
    },
}

module.exports = apiController
