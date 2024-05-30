const mongoose = require('mongoose')
class ConnectMongoDB {
    constructor() {
        this.instance
        this.mongoString = process.env.MONGO_DB
    }
    connect = function () {
        if (!this.instance) {
            mongoose.connect(this.mongoString)
            const database = mongoose.connection
            this.instance = database
            database.on('error', (error) => {
                console.log(error)
            })

            database.once('connected', () => {
                console.log('Database Connected')
            })
        }
    }
}
const mongodb = new ConnectMongoDB()
module.exports = mongodb
