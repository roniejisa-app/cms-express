const { SaleCost } = require('../../../../models')

module.exports = {
    find: async (req, res, next) => {
        try{
            const { id } = req.params
            const cost = await SaleCost.findByPk(id)
            res.json({
                status: 200,
                cost,
            })
        }catch(e){
            next()
        }
    },
}
