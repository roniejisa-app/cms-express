'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('module_permission', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            module_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: "modules"
                    },
                    key: "id"
                },
            },
            permission_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: "permissions"
                    },
                    key: "id"
                },
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        })
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};
