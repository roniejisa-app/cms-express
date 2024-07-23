module.exports = {
    css: [
        {
            type: 'css',
            name: 'product-variant',
            attributes: [
                {
                    key: 'href',
                    value: '/core/plugins/ecommerce/css/product-variant.css',
                },
            ],
            hasCloseTag: true
        },
    ],
    js: [
        {
            type: 'js',
            name: 'product-variant',
            attributes: [
                {
                    key: 'src',
                    value: '/core/plugins/ecommerce/js/product-variant2.js',
                },
                {
                    key: 'type',
                    value: 'module'
                }
            ],
        },
    ],
}
