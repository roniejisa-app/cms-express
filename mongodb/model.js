const { sync } = require('glob')
const path = require('path')
const fs = require('fs')
const basename = path.basename(__filename)
const Setting = require('./setting.model')
const db = {}
let files = sync(process.cwd() + '/platform/plugins/*/mongodb/*').filter(
    (file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        )
    }
)
for (let i = 0; i < files.length; i++) {
    let indexOf = files[i].lastIndexOf('/')
    let filename = files[i].slice(indexOf + 1)
    filename = filename.slice(0, filename.indexOf('.') - 1)
    const model = require(files[i])
    if (db[filename]) {
        throw new Error('Bảng này đã tồn tại')
    }
    db[filename.charAt(0).toUpperCase() + filename.slice(1)] = model
}
// Mặc định
fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1 &&
            file.indexOf('index.js') === -1
        )
    })
    .forEach((file) => {
        let indexOf = file.lastIndexOf('/')
        let filename = file.slice(indexOf + 1)
        filename = filename.slice(0, filename.indexOf('.'))
        const model = require(path.join(__dirname, file))
        db[filename.charAt(0).toUpperCase() + filename.slice(1)] = model
    })
module.exports = db
