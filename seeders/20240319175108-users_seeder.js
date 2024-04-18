'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require("bcrypt");

module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = bcrypt.genSaltSync(10);

        const users = [{
            fullname: "Minh Hiếu",
            email: "roniejisa@gmail.com",
            password: bcrypt.hashSync('123456', salt),
            status: true,
            created_at: new Date(),
            updated_at: new Date()
        }];

        await queryInterface.bulkInsert("users", users);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("users");
    }
};
