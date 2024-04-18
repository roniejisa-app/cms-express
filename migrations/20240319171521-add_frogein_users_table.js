'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("users", {
            name: "users_group_id_foreign",
            fields: ["group_id"],
            type: 'foreign key',
            references: {
                table: "groups",
                field: "id"
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint("users", "users_group_id_foreign")
    }
};
