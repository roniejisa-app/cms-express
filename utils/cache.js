const { createClient } = require('redis')
const { Module, ManagerModule } = require('@models/index')
const {
    CACHE_ADMIN_MENU,
    CACHE_USER_PERMISSION,
    CACHE_ADMIN_MENU_LIST,
    CACHE_USER_LOGGED,
} = require('../constants/cache')

class CacheInstance {
    constructor() {
        this.connectionPromise = null
    }

    async connect() {
        if (!this.connectionPromise) {
            this.connectionPromise = await createClient({
                url: process.env.REDIS_URL,
            })
                .on('error', (err) => console.log('Redis Client Error', err))
                .connect()
        }
        return this.connectionPromise
    }
}

var Cache = new CacheInstance().connect()

module.exports = {
    Cache,
    getMenu: async (user) => {
        return JSON.parse(await (await Cache).get(CACHE_ADMIN_MENU+user.id))
    },
    setMenu: async (req, clearCache = false) => {
        if (!req.menus || !Array.isArray(req.menus) || clearCache) {
            req.menus = await Module.findAll({
                include: [
                    {
                        model: ManagerModule,
                        as: 'managerModule',
                    },
                ],
            })
            module.exports.set(CACHE_ADMIN_MENU+req.user.id, req.menus)
        }
    },
    set: async (key, value) => {
        try {
            await (await Cache).set(key, JSON.stringify(value))
            return value
        } catch (e) {
            return false
        }
    },
    get: async (key, defaultValue = false) => {
        let data = await (await Cache).get(key)
        if (JSON.parse(data) === 'true' || JSON.parse(data) === false) {
            return JSON.parse(data) === 'true'
        }
        return data ? JSON.parse(data) : defaultValue
    },
    findOrCreate: async (key, cb, clearCache = false, ...args) => {
        let data = await module.exports.get(key)
        // Kiểm tra không undefined, false, null không tính trường hợp '', 0;
        if (
            data !== false &&
            data !== undefined &&
            data !== null &&
            !clearCache
        ) {
            return data
        }
        let value = null
        if (typeof cb === 'function') {
            if (cb.constructor.name === 'AsyncFunction') {
                value = await cb(...args)
            } else {
                value = cb()
            }
            await module.exports.set(key, value)
            return value
        } else {
            return cb
        }
    },
    clearAllCache: async (req, res) => {
        await Promise.all([
            (await Cache).del(CACHE_USER_PERMISSION + req.users.id),
            (await Cache).del(CACHE_ADMIN_MENU + req.users.id),
            (await Cache).del(CACHE_ADMIN_MENU_LIST + req.users.id),
            (await Cache).del(CACHE_USER_LOGGED + req.users.id)
        ])
    },
    clearCache: async (req, res) => {
        await module.exports.setMenu(req, true)
        res.redirect('/admin')
    },
}
