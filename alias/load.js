const { sync } = require('glob')
const path = require('path')
const fs = require('fs')
const basename = path.basename(__filename)
const i18n = require('i18n')
const checkAliasFile = (file) => {
    return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.alias.js') !== -1 &&
        file.indexOf('.test.js') === -1
    )
}
const loadAlias = async (app) => {
    const files = fs
        .readdirSync(__dirname)
        .filter((file) => checkAliasFile(file))
    for (let file of files) {
        app.locals[file.replace('.alias.js', '')] = require(path.join(
            __dirname,
            file
        ))
        await app.locals[file.replace('.alias.js', '')].init()
    }
    app.locals.i18n = i18n
}

module.exports = loadAlias
