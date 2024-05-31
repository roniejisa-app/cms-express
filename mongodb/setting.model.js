const mongoose = require('mongoose')
const { string } = require('yup')
const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    content: {
        type: String,
    },
    class: {
        type: String,
    },
    order:{
        type: Number
    },
    key: {
        required: true,
        unique:true,
        type: String,
    },
    type: {
        required: true,
        type: String,
    },
    tab: {
        required: true,
        type: String,
    },
    tab_label: {
        required: true,
        type: String,
    },
})

class Setting {
    constructor() {
        this.DB = mongoose.model('Setting', dataSchema)
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
            {
                name: 'content',
                label: 'Nội dung',
                type: 'text',
                show: true,
                showForm: true,
                filterDefault: true,
                positionSidebar: false,
                filter: true,
                sort: true,
            },
            {
                name: 'image',
                label: 'Ảnh đại diện',
                type: 'image',
                show: true,
                showForm: true,
                filterDefault: true,
                positionSidebar: true,
                filter: false,
                sort: false,
                order: 1,
            },
        ]
    }

    static validate(id = null) {
        let validate = {
            name: string().required('Vui lòng nhập tên'),
            content: string().required('Vui lòng nhập nội dung'),
        }
        return validate
    }
}
module.exports = Setting
