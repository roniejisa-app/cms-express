const fs = require('fs')
const logError = (err) => {
    if (err) {
        fs.appendFile(process.cwd() + '/error-log.txt', err + '\n')
    }
}
module.exports = { logError }