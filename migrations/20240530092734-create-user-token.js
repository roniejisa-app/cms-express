'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_tokens', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            refresh_token: {
                type: Sequelize.TEXT,
            },
            user_id: {
                type: Sequelize.INTEGER,
            },
            user_agent: {
                type: Sequelize.TEXT,
            },
            ip_address: Sequelize.STRING(45),
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_tokens')
    },
}
