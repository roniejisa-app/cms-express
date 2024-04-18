require('dotenv').config()
const { Sequelize } = require('sequelize');
const db = {}

const sequelize = new Sequelize(process.env.DB_database,
    process.env.DB_username,
    process.env.DB_password, {
    host: process.env.DB_host,
    dialect: 'postgres',
    port: process.env.DB_port,
    logging: console.log,
    freezeTableName: true,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db