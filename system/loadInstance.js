const i18n = require('i18n')
const { pathPlugin } = require('../utils/all')
const { readJson } = require('../utils/write');
const constants = {
    BUTTON_TABLE: 'table',
    FORM_ACCESS: 'form'
}
function getPluginFormModule(module){
    switch(module){
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
    app.locals.add_button_table = (module,key) => {
        if(!module || !key) return '';
        try{
            const data = require(process.cwd()+'/platform/plugins/'+getPluginFormModule(module)+'/actions/'+constants[key] + '.js');
            let html = ``;
            for(const {tag,label,className} of data){
                html += `<${tag} class=${className}>${label}</${tag}>`;
            }
            return html;
        }catch(e){
            return '';
        }
    }
    
    app.locals.add_asset_form = (module,key,type) => {
        if(!module || !key) return '';
        // try{
            const data = require(process.cwd()+'/platform/plugins/'+getPluginFormModule(module)+'/actions/'+constants[key] + '.js');
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
                }
                html += `<${tag} ${tag === 'link' ? 'rel=stylesheet' : '' } ${attributes.map(({key, value}) => {
                    return `${key}='${value}'`
                }).join(' ')}`;
                if(hasCloseTag){
                    html += `> ${value ? value : ''}</${tag}>`
                }else{
                    html += ` />`;
                }
            }
            console.log(html);
            return html;
        // }catch(e){
        //     return '';
        // }
    }
}
module.exports = loadInstance