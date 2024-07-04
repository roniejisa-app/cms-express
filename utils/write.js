const fs = require('fs')
const checkHelperInstance = require('../alias/CheckHelper.alias')
const logError = (data, fileLog = 'cms-error.txt') => {
    if (!checkHelperInstance.isString(data)) {
        data = JSON.stringify(data)
    }
    fs.appendFile(process.cwd() + '/logs/' + fileLog, data + '\n', (err) => {
        if (err) throw err
        console.log('Dữ liệu đã được ghi vào file log.')
    })
}

const readJson = (file) => {
    const data = fs.readFileSync(process.cwd() + file, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
    })
    let jsonData = JSON.parse(data)
    return jsonData
}

const writeJson = (file, data) => {
    return fs.writeFileSync(
        process.cwd() + file,
        JSON.stringify(data, null, 2),
        (err) => {
            if (err) {
                console.error(err)
                return
            }
        }
    )
}

const readFile = (file) => {
    return fs.readFileSync(process.cwd() + file, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
    })
}

const writeFile = (file, data) => {
    return fs.writeFileSync(process.cwd() + file, data, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })
}

module.exports = { logError, writeJson, readJson, readFile, writeFile }
