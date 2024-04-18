const { User, Phone, Post, Course } = require("../models/index");
const { Op } = require('sequelize');
module.exports = {
    index: async (req, res, next) => {
        var { status, keyword } = req.query;
        var filters = {}
        if (status === "active" || status === "inactive") {
            filters.status = status === "active";
        }

        if (keyword) {
            filters[Op.or] = {
                email: {
                    [Op.iLike]: `%${keyword}%`
                },
                name: {
                    [Op.iLike]: `%${keyword}%`
                }
            }
        }
        try {
            let users = await User.findAll({
                where: filters,
                include: [{
                    model: Phone,
                    as: 'phone'
                }]
            });
            // res.json(users);
            res.render('users/index', { users, req });
        } catch (e) {
            next(e);
        }
    },
    add: async (req, res) => {
        const courses = await Course.findAll({
            attributes: ["name", "id"],
            order: [["name", "asc"]]
        })
        res.render("users/add", {
            courses, req
        });
    },
    handleAdd: async (req, res) => {
        const body = req.body;
        // Tạo 1 array chứa các instance của từng khóa học được chọn

        const user = await User.create({
            name: body.name,
            email: body.email,
            status: +body.status === "1" ? true : false
        })

        if (user) {
            let courses = body.courses;
            courses = Array.isArray(courses) ? courses : [courses];
            if (courses.length) {
                const coursesInstance = await Promise.all(courses.map((courseId) => {
                    return Course.findByPk(courseId)
                }))
                await user.addCourses(coursesInstance);
            }
        }
        res.redirect('/users');
    },
    edit: async (req, res) => {
        const courses = await Course.findAll({
            attributes: ["name", "id"],
            order: [["name", "asc"]]
        })
        const { id } = req.params;
        const user = await User.findOne({
            where: {
                id
            },
            include: [{
                model: Course,
                as: "courses"
            }]
        });
        res.render("users/edit", { user, courses, req });
    },
    handleUpdate: async (req, res) => {
        const { id } = req.params;
        let { name, status, email, courses } = req.body;
        await User.update({
            name: name,
            status: status === "1",
            email: email
        }, {
            where: {
                id: id
            }
        });

        courses = Array.isArray(courses) ? courses : [courses];
        if (courses.length) {
            const coursesInstance = await Promise.all(courses.map((courseId) => {
                return Course.findByPk(courseId)
            }))
            const user = await User.findByPk(id);
            await user.setCourses(coursesInstance);
        }
        res.redirect("/users/edit/" + id);
    },
    delete: async (req, res) => {
        const { id } = req.params;
        await User.destroy({
            where: {
                id: id
            },
            force: true // Kích hoạt xóa vĩnh viễn
        })
        res.redirect("/users");
    }
}