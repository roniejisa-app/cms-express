const { sync } = require('glob')
const path = require('path')
const loadService = (app) => {
    let serviceFiles = sync(
        process.cwd() + '/platform/plugins/*/services/*'
    ).filter((file) => {
        return file.indexOf('.') !== 0 && file.slice(-3) === '.js'
    })

    for (let i = 0; i < serviceFiles.length; i++) {
        const service = require(path.join(process.cwd(), serviceFiles[i]))
        service(app)
    }
}
module.exports = loadService