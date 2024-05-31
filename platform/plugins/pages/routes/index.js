const express = require('express')
const router = express.Router()
const fs = require('fs')
const { resolve } = require('path')
const pageController = require('../controllers/page.controller')
router.use((req, res, next) => {
    if(req.url.includes("custom-page")){
        req.app.set('views', resolve(__dirname, '../views'))
    }else{
        req.app.set('views', process.cwd() + '/views');
    }
    next()
})

router.get('/admin/pages/custom-page/:id', pageController.customPage)

router.post('/endpoint/store', async (req, res) => {
    const data = req.body
    fs.writeFileSync(
        process.cwd() + `/platform/plugins/pages/data/${data.id}.tpl`,
        JSON.stringify(data),
        {
            flag: 'w+',
        }
    )
    return res.json({
        status: 200,
        message: 'Lưu thành công!',
    })
})

router.get('/endpoint/load/:id', (req, res) => {
    const { id } = req.params;
    const checkFile = fs.existsSync(process.cwd() + `/platform/plugins/pages/data/${id}.tpl`);
    if(checkFile){
        const string = fs.readFileSync(
            process.cwd() + `/platform/plugins/pages/data/${id}.tpl`
        )
        return res.json(JSON.parse(string).data)
    }
    return res.json({
        status:200,
        data:[]
    });
})

module.exports = router
