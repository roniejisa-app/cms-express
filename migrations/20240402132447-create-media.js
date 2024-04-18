'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('medias', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            filename: {
                type: Sequelize.STRING
            },
            path: {
                type: Sequelize.STRING
            },
            path_absolute: {
                type: Sequelize.STRING
            },
            media_id: {
                type: Sequelize.INTEGER
            },
            customs: {
                type: Sequelize.TEXT
            },
            is_file: {
                type: Sequelize.BOOLEAN
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            note: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.STRING
            },
            extension: {
                type: Sequelize.STRING(20),
            },
            delete_at: {
                type: Sequelize.DATE,
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('medias');
    }
};