'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("phones", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            phone: {
                type: Sequelize.STRING(15)
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: "users",
                    },
                    key: "id"
                }
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("phones");
    }
};
