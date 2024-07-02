'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('product_attribute_details', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            product_attribute_id: Sequelize.INTEGER,
            name: {
                type: Sequelize.STRING,
                allowNull: false,
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
        await queryInterface.dropTable('product_attribute_details')
    },
}
