'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'address', {
            type: Sequelize.STRING(200),
            allowNull: true
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', "address");
    }
};
