const {
    Op: { iLike, eq, or, and, gt, lt },
} = require('sequelize')

module.exports = {
    convertDataFilter: (body, fields) => {
        const { field, type, value } = body
        let filters = {}
        if (!field) {
            return filters
        }
        for (let i = 0; i < field.length; i++) {
            const nameSearch = field[i]
            const typeSearch = type[i]
            const valueSearch = value[i]
            const fieldInfo = fields.find(({ name }) => name === nameSearch)
            if (!filters[and]) {
                filters[and] = []
            }

            switch (fieldInfo.type) {
                case 'text':
                    if (typeSearch === 'equal') {
                        let obj = {}
                        obj[nameSearch] = {
                            [eq]: valueSearch,
                        }
                        filters[and].push(obj)
                    } else if (typeSearch === 'small_than') {
                        let obj = {}
                        obj[nameSearch] = {
                            [lt]: valueSearch,
                        }
                        filters[and].push(obj)
                    } else if (typeSearch === 'large_than') {
                        let obj = {}
                        obj[nameSearch] = {
                            [gt]: valueSearch,
                        }
                        filters[and].push(obj)
                    } else {
                        let obj = {}
                        obj[nameSearch] = {
                            [iLike]: `%${valueSearch}%`,
                        }
                        filters[and].push(obj)
                    }
                    break
            }
        }
        return filters
    },
    convertDataFilterMongoDB: (body, fields) => {
        const { field, type, value } = body
        let filters = {}
        if (!field) {
            return filters
        }
        for (let i = 0; i < field.length; i++) {
            const nameSearch = field[i]
            const typeSearch = type[i]
            const valueSearch = value[i]
            if (valueSearch === '') {
                continue
            }
            const fieldInfo = fields.find(({ name }) => name === nameSearch)
            if(!fieldInfo) return filters;
            if (!filters['$or']) {
                filters['$or'] = []
            }
            switch (fieldInfo.type) {
                case 'text':
                    if (typeSearch === 'equal') {
                        let obj = {}
                        obj[nameSearch] = valueSearch
                        filters['$or'].push(obj)
                    } else if (typeSearch === 'small_than') {
                        let obj = {}
                        obj[nameSearch] = {
                            $lt: valueSearch,
                        }
                        filters['$or'].push(obj)
                    } else if (typeSearch === 'large_than') {
                        let obj = {}
                        obj[nameSearch] = {
                            $gt: valueSearch,
                        }
                        filters['$or'].push(obj)
                    } else {
                        let obj = {}
                        obj[nameSearch] = {
                            $regex: `${valueSearch}`,
                            $options: 'i',
                        }
                        filters['$or'].push(obj)
                    }
                    break
            }
        }
        return filters
    },
}
