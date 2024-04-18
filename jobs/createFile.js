const fs = require('fs');

module.exports = (data) => {
    /**
     * Tên file muốn tạo
     * Nội dung muốn thêm
     */

    const path = process.cwd() + "/data/" + data.filename;
    fs.writeFileSync(path, data.content);
    return true;
}