const { Op } = require('sequelize');
const { Permission } = require('../models/index')
const { string } = require('yup');
module.exports = {
    index: async (req, res) => {
        var { keyword } = req.query;
        var filters = {};
        if (keyword) {
            filters.name = {
                [Op.iLike]: `%${keyword}%`
            }
        }
        var permissions = await Permission.findAll({
            where: filters
        })
        res.render('permissions/index', {
            permissions, keyword, req
        });
    },
    add: (req, res) => {
        res.render('permissions/add', {
            req
        });
    },
    handleAdd: async (req, res, next) => {
        const body = await req.validate(req.body, {
            value: string().required('Vui lòng nhập tên quyền').matches(/^[a-z]/, { message: "Không đúng định dạng" })
        })
        if (body) {
            await Permission.create(body);
            req.flash("msg", "Thêm quyền thành công");
            res.redirect('/admin/permissions');
        } else {
            return res.redirect('/admin/permissions/add');
        }
    },
    edit: async (req, res) => {
        const { id } = req.params;
        const permission = await Permission.find
        res.redirect('/admin/permission', {
            req, permission
        });
    },
    handleEdit: (req, res) => {
        res.redirect('/admin/permission');
    }
}