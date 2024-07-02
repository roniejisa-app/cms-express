const express = require('express')
const router = express.Router()
const {Language,Word} = require('../../../../models/index')

router.get('/i18n',async (req, res) => {
    const data =await Language.findAll({
        include:{
            model: Word,
            as:'words'
        }
    })
    console.log(data);
    return res.json({
        status: 200,
        message: 'Hi',
    })
})

module.exports = router