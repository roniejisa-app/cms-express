'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('groups', [
            {
                name: "Administrator",
                created_at: new Date(),
                updated_at: new Date()
            }, {
                name: "Manager",
                created_at: new Date(),
                updated_at: new Date()
            }, {
                name: "Staff",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: "Subscriber",
                created_at: new Date(),
                updated_at: new Date()
            }
        ])
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('groups')
    }
};
