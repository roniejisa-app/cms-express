const express = require("express");
const router = express.Router();
var csrf = require('csurf');
const { pathPlugin } = require("../../../../utils/all");
var csrfProtect = csrf({ cookie: true })
const i18n = require('i18n');
router.get('/crawl', csrfProtect, async (req, res) => {
    return res.render(pathPlugin('crawl', 'views', 'index'), {
        req,
        module: 'crawl',
        name_show: i18n.__('crawl'),
        csrfToken: req.csrfToken(),
    })
});

module.exports = router;