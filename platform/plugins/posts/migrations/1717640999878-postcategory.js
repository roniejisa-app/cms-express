'use strict'
/** @type {import('sequelize-cli').Migration} */
const { Sequelize } = require('sequelize')
module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.createTable('post_categories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: Sequelize.STRING,
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
        await queryInterface.dropTable('post_categories')
    },
}
