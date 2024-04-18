'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('role_module_permission', {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            role_id: {
                type: Sequelize.INTEGER,
                // references: {
                //     model: {
                //         tableName: "roles"
                //     },
                //     key: "id"
                // }
            },
            module_permission_id: {
                type: Sequelize.INTEGER,
                // references: {
                //     model: {
                //         tableName: "module_permission"
                //     },
                //     key: "id"
                // }
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('role_module_permission');
    }
};