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
    order: {
        type: Number,
    },
    key: {
        required: true,
        unique: true,
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
                api: true,
            },
            {
                name: 'key',
                label: 'Khoả',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: true,
            },
            {
                name: 'content',
                label: 'Nội dung',
                type: 'textarea',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: true,
            },
            {
                name: 'class',
                label: 'Class',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: false,
            },
            {
                name: 'order',
                label: 'Sắp xếp',
                type: 'number',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: false,
            },

            {
                name: 'type',
                label: 'Kiểu',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: false,
            },
            {
                name: 'tab',
                label: 'Tab',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: false,
            },
            {
                name: 'tab_label',
                label: 'Tiêu đề',
                type: 'text',
                show: true,
                showForm: true,
                positionSidebar: false,
                filter: true,
                sort: true,
                api: false,
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
