const { User } = require("../../../models/index");

module.exports = {
    index: async (req, res) => {
        const response = {};
        try {
            const { order = 'asc', sort = 'id' } = req.query;

            const { count, rows: users } = await User.findAndCountAll({
                attributes: {
                    exclude: ["password", "provider_id", "reset_token"]
                },
                order: [[sort, order]]
            });
            Object.assign(response, {
                status: 200,
                message: "Success",
                data: users,
                count
            });
        } catch (e) {

        }
        res.status(response.status).json(response);
    }
}