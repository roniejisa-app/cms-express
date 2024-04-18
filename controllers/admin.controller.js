module.exports = {
    dashboard: (req, res) => {
        var name_show = "Trang tổng quan";
        return res.render("admin/dashboard", { req, name_show });
    }
}