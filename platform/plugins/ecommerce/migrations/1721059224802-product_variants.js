'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('product_variants', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            sku:{
                type: Sequelize.STRING,
            },
            data_variants:{
                type: Sequelize.TEXT
            },
            quantity:{
                type: Sequelize.INTEGER
            },
            price:{
                type: Sequelize.DECIMAL,
            },
            created_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            },
            updated_at: {
                defaultValue: Sequelize.fn('NOW'),
                type: Sequelize.DATE,
            },
        })
    },
    async down({ context: queryInterface }) {
        await queryInterface.dropTable('product_variants')
    },
}
