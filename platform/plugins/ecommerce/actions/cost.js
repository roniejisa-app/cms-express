module.exports = {
    css: [
        {
            type: 'css',
            name: 'sale-costs',
            attributes: [
                {
                    key: 'href',
                    value: '/core/plugins/sale-cost/css/costs.css',
                },
            ],
            hasCloseTag: true
        },
    ],
    js: [
        {
            type: 'js',
            name: 'sale-costs',
            attributes: [
                {
                    key: 'src',
                    value: '/core/plugins/sale-cost/js/costs2.js',
                },
                {
                    key: 'type',
                    value: 'module'
                }
            ],
        },
    ],
}