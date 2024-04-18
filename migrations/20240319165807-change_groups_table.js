'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'group_id', {
            type: Sequelize.INTEGER,
            references: {
                model: {
                    tableName: "groups"
                },
                key: "id",
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'group_id')
    }
};
