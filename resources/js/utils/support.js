export const toKebabCase = (str) => {
    // Bảng chuyển đổi các ký tự đặc biệt sang dấu gạch ngang
    const specialCharMap = {
        a: 'áàảãạăắằẳẵặâấầẩẫậ',
        e: 'éèẻẽẹêếềểễệ',
        i: 'íìỉĩị',
        o: 'óòỏõọôốồổỗộơớờởỡợ',
        u: 'úùủũụưứừửữự',
        y: 'ýỳỷỹỵ',
        d: 'đ',
    }

    // Chuyển đổi sang chữ thường
    str = str.toLowerCase()

    // Thay thế các ký tự đặc biệt bằng dấu gạch ngang
    for (const char in specialCharMap) {
        const regex = new RegExp(`[${specialCharMap[char]}]`, 'g')
        str = str.replace(regex, char)
    }

    // Thay thế khoảng trắng và các ký tự không mong muốn bằng dấu gạch ngang
    return str.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
}
