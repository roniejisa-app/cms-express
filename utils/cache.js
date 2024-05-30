const { createClient } = require('redis')
const { Module } = require('../models/index')

class CacheInstance {
    constructor() {
        this.connectionPromise = null
    }

    async connect() {
        if (!this.connectionPromise) {
            this.connectionPromise = await createClient()
                .on('error', (err) => console.log('Redis Client Error', err))
                .connect()
        }
        return this.connectionPromise
    }
}

var Cache = new CacheInstance().connect()

module.exports = {
    Cache,
    getMenu: async () => {
        return JSON.parse(await (await Cache).get('menus'))
    },
    setMenu: async (req, clearCache = false) => {
        if (!req.menus || !Array.isArray(req.menus) || clearCache) {
            req.menus = await Module.findAll()
            module.exports.set('menus', req.menus)
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
    get: async (key) => {
        let data = await (await Cache).get(key)
        if (JSON.parse(data) === 'true' || JSON.parse(data) === false) {
            return JSON.parse(data) === 'true'
        }
        return data ? JSON.parse(data) : false
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
    clearCache: async (req, res) => {
        await module.exports.setMenu(req, true)
        res.redirect('/admin')
    },
}
