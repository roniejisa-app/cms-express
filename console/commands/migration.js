const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const process = require('process')
const env = process.env.NODE_ENV || 'development'

const migrationDB = async () => {
    const config = require(process.cwd() + '/config/config.js')[env]
    let sequelize
    if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config)
    } else {
        sequelize = new Sequelize(
            config.database,
            config.username,
            config.password,
            config
        )
    }

    const umzug = new Umzug({
        migrations: {
            glob: 'platform/plugins/**/migrations/*.js',
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
    })
    await umzug.up()
}

module.exports = migrationDB
