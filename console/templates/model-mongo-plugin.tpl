const mongoose = require('mongoose')
const { string } = require('yup')
const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    }
})

class MODEL_NAME {
    constructor() {
        this.DB = mongoose.model('MODEL_NAME', dataSchema)
    }

    static fields() {
        return [
            {
                name: 'name',
                label: 'Tên',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
            },
        ]
    }

    static validate(id = null) {
        let validate = {
            name: string().required('Vui lòng nhập tên'),
            content: string().required("Vui lòng nhập nội dung"),
        }
        return validate
    }
}
module.exports = MODEL_NAME