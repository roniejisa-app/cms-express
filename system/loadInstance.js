const i18n = require('i18n')
const { pathPlugin } = require('../utils/all')
const { readJson } = require('../utils/write');
const constants = {
    "crawls|BUTTON_TABLE": 'table',
    "products|FORM_ACCESS": 'form',
    "sale-costs|FORM_ACCESS": 'cost',
    "sale-costs|BUTTON_TABLE": 'cost-table',
    "sale-costs|TABLE_VIEW": 'cost-table',
}
function getPluginFormModule(module){
    switch(module){
        case 'sale-costs':
        case 'products':
            return 'ecommerce';
        case 'crawls':
            return 'crawls';
    }
}

const loadInstance = async (app) => {
    app.locals.i18n = i18n
    // Thêm các hành động trong bảng
    // Dữ liệu được thêm vào trong folder actions của từng plugin
    
    app.locals.add_asset_form = (module,key,type) => {
        if(!module || !key) return '';
        try{
            const data = require(process.cwd()+'/platform/plugins/'+getPluginFormModule(module)+'/actions/'+constants[module+"|"+key] + '.js');
            let html = ``;
            for(let item of data[type]){
                let {type, value, hasCloseTag, attributes} = item;
                hasCloseTag = hasCloseTag ? hasCloseTag : false;
                let tag = '';
                switch(type){
                    case 'css':
                        tag = 'link'
                        break;
                    case 'js':
                        tag = 'script'
                        break;
                    case 'button':
                        tag = 'button'
                        break;
                }
                html += `<${tag} ${tag === 'link' ? 'rel=stylesheet' : '' } ${attributes.map(({key, value}) => {
                    return `${key}='${value}'`
                }).join(' ')}`;
                if(hasCloseTag){
                    html += ` />`;
                }else{
                    html += `> ${value ? value : ''}</${tag}>`
                }
            }
            console.log(html);
            return html;
        }catch(e){
            return '';
        }
    }
}
module.exports = loadInstance