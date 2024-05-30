'use strict'
const { Model } = require('sequelize')
const { string } = require('yup')
module.exports = (sequelize, DataTypes) => {
    class Task extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static fields() {
            return [
                {
                    name: 'task_id',
                    label: 'Mã',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    api: true,
                },
                {
                    name: 'column',
                    label: 'Mã bảng',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    api: true,
                },
                {
                    name: 'columnName',
                    label: 'Tên',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    api: true,
                },
                {
                    name: 'content',
                    label: 'Mội dung',
                    type: 'text',
                    show: true,
                    sort: true,
                    filter: true,
                    showForm: true,
                    filterDefault: true,
                    positionSidebar: false,
                    api: true,
                },
            ]
        }
        static validate() {
            let validate = {
                content: string().required('Vui lòng thêm nội dung'),
                column: string()
                    .matches(/[a-zA-Z]/, {
                        message: 'Không đúng định dạng bảng',
                    })
                    .required('Vui lòng thêm bảng'),
                columnName: string().required('Vui lòng thêm tên bảng'),
            }
            return validate
        }
    }
    Task.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
            },
            column: DataTypes.STRING,
            task_id: DataTypes.INTEGER,
            columnName: DataTypes.STRING,
            content: DataTypes.STRING,
        },
        {
            sequelize,
            undefined: 'Task',
            tableName: 'tasks',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
    return Task
}
