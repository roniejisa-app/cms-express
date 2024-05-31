class CheckHelper {
    init() {}
    isString(value) {
        return typeof value === 'string'
    }
    isNullish(value) {
        return (value === null || value === undefined)
    }

    isEmpty(value) {
        return (this.isString(value) && value.length === 0)
    }

    isNumber(value) {
        return (typeof value === 'number')
    }

    isArray(value) {
        return Array.isArray(value)
    }

    isObject(value) {
        return (value && typeof value === 'object' && value.constructor === Object)
        
    }

    isFalsy(value) {
        return !value
    }

    isTruthy(value) {
        return !!value
    }
}

const checkHelperInstance = new CheckHelper()
module.exports = checkHelperInstance