'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('words', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            key: Sequelize.STRING,
            value: Sequelize.STRING,
            code: Sequelize.STRING,
            module: Sequelize.STRING,
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
        })
    },
    async down({ context: queryInterface }) {
        await queryInterface.dropTable('words')
    },
}
