const fs = require('fs')
const logError = (err) => {
    if (err) {
        fs.appendFile(process.cwd() + '/error-log.txt', JSON.stringify(err) + '\n')
    }
}
module.exports = { logError }