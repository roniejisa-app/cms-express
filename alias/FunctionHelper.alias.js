const checkHelperInstance = require('./CheckHelper.alias');

class FunctionHelper {
    constructor() {
        this.defaultImage = process.env.BASE_URL + '/images/admin/no-image.svg';
        this.baseUrl = process.env.BASE_URL;
    }
    init() {}

    getImage(data) {
        const checkValue = checkHelperInstance.isString(data);
        if(checkValue){
            const obj = JSON.parse(data);
            const checkObj = checkHelperInstance.isObject(obj);
            if(!checkObj) return this.defaultImage;
            if(checkObj && !obj.path_absolute) return this.defaultImage;
            if(checkObj && obj.path_absolute && obj.path_absolute.startsWith("/")) return (this.baseUrl + obj.path_absolute);
            if(checkObj && obj.path_absolute) return process.env.BASE_URL + '/' + obj.path_absolute;
        }
        return this.defaultImage;
    }
}

const functionHelperInstance = new FunctionHelper()
module.exports = functionHelperInstance