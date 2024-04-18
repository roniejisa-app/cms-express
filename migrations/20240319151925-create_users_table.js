'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            fullName: {
                type: Sequelize.STRING(30),
                allowNull: false //not null
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            avatar: {
                type: Sequelize.TEXT,
            },
            banner: {
                type: Sequelize.TEXT,
            },
            address: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING(100),
            },
            provider_id: {
                type: Sequelize.INTEGER,
            },
            reset_token: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE
            },
            updated_at: {
                type: Sequelize.DATE
            }
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
