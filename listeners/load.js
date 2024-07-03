const { sync } = require('glob')
const path = require('path')

const loadListener = (app) => {
    let serviceFiles = sync(
        process.cwd() + '/platform/plugins/*/listeners/*'
    ).filter((file) => {
        return file.indexOf('.') !== 0 && file.slice(-3) === '.js'
    })

    for (let i = 0; i < serviceFiles.length; i++) {
        const listener = require(path.join(process.cwd(), serviceFiles[i]))
        listener(app)
    }
}
module.exports = loadListener