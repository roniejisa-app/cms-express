const mongoose = require('mongoose')
const { string } = require('yup')
const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    content: {
        required: true,
        type: String,
    },
})

class Post {
    constructor() {
        this.DB = mongoose.model('Post', dataSchema)
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
        ]
    }

    static validate(id = null) {
        let validate = {
            fullname: string().required('Vui lòng nhập tên'),
            content: string().test(
                'check-status',
                'Trạng thái không hợp lệ',
                (value) => {
                    return +value === 0 || +value === 1
                }
            ),
        }
        return validate
    }
}
module.exports = Post
