'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('providers', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: Sequelize.STRING,
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE
        })

        await queryInterface.addColumn('users', 'provider_id', {
            type: Sequelize.INTEGER,
            references: {
                model: {
                    tableName: "providers"
                },
                key: "id"
            }
        })
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'provider_id');
        queryInterface.dropTable('providers')
    }
};
