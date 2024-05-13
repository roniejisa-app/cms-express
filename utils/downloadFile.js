const https = require('https')
const fs = require('fs')
/**
 *
 * @param {*} url
 * @param {*} fullPath
 * @param {*} callbackDone
 * @param {*} callbackError
 */

module.exports = {
    downloadFileFromLink: (
        url,
        fullPath,
        callbackDone = () => {},
        callbackError = () => {}
    ) => {
        let file = fs.createWriteStream(fullPath)
        https.get(url, function (response) {
            response.pipe(file)
            file.on('finish', function () {
                callbackDone()
            }).on('error', function (err) {
                fs.unlink(dest) // Delete the file async if there is an error
                callbackError()
            })
        })
    },
}
