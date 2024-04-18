module.exports = {
    /**
     * Thêm hoặc sửa Item thêm quan hệ cho chính nó
     * @param {*} modelName // Model Associate
     * @param {*} valueKey // Key giá trị thê
     * @param {*} labelKey // Key Tên hiển thị
     * @param {*} fn // Định danh của associate
     */
    chooseMultiAssoc: (modelName, valueKey, labelKey, fn) => {
        return {
            type: "selectMultiAssoc",
            modelName: modelName,
            valueKey: valueKey,
            labelKey: labelKey,
            /**
             * Thêm hoặc sửa Item thêm quan hệ cho chính nó
             * @param {*} item // Item hiện tại đang chỉnh sửa hoặc thêm
             * @param {*} model // Model chính là modelTable
             * @param {*} data // Các id quan hệ với Item
             * @param {*} isAdd // Kiểm tra xem có phải thêm mới
             */
            addOrEditAssociate: async (item, model, data, isAdd = true) => {
                data = await Promise.all(data.map((id) => {
                    return model.findByPk(id)
                }));
                console.log(data);
                fn = (isAdd ? 'add' : 'set') + fn;
                await item[fn](data);
            },
            data: async (model) => {
                return await model.findAll({ attribute: [valueKey, labelKey] })
            }
        }
    },
    /**
     * Thêm hoặc sửa Item thêm quan hệ cho chính nó
     * @param {*} modelName // Model Associate
     * @param {*} valueKey // Key giá trị thê
     * @param {*} labelKey // Key Tên hiển thị
     */
    selectAssoc: (modelName, valueKey, labelKey) => {
        return {
            data: async (model) => {
                const results = await model.findAll({ attributes: [valueKey, labelKey] });
                return results;
            },
            type: "selectAssoc",
            modelName: modelName,
            valueKey: valueKey,
            labelKey: labelKey
        }
    }
}