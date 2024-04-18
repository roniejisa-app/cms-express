const { Role } = require('../models/index');
const { Op } = require('sequelize');

module.exports = {
    index: async (req, res) => {
        const { keyword } = req.query;

        let filter = {};

        if (keyword) {
            filter.name = {
                [Op.iLike]: `%${keyword}%`
            }
        }
        const roles = await Role.findAll({
            where: filter
        });
        return res.render('roles/index', { roles, keyword, req });
    },
    add: async (req, res) => {
        return res.render("roles/add");
    },
    handleAdd: async (req, res) => {
        return res.redirect("/admin/roles")
    },
    edit: async (req, res) => {
        const { id } = req.params;
        const role = await Role.findOne({
            where: {
                id
            }
        })

        return res.render('roles/render', {
            role
        });
    }
}