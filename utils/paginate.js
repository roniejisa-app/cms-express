const hash = process.env.PAGINATE_HASH
module.exports = {
    initPaginate: (count, limit, page) => {
        let totalPage = Math.ceil(count / limit)
        let output = '<div class="paginate">'
        if (page > 1) {
            output += `<a href="/admin/${hash}?page=${
                +page - 1
            }" data-fetch="${+page - 1}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
            </a>`
        }
        for (let i = 1; i <= totalPage; i++) {
            if (i === +page) {
                output += `<span class="${i === +page ? 'active' : ''}">${i}</span>`
            } else if (
                [
                    1,
                    2,
                    totalPage,
                    totalPage - 1,
                    +page + 1,
                    +page + 2,
                    +page - 1,
                    +page - 2,
                    +page,
                ].includes(i)
            ) {
                output += `<a href="/admin/${hash}?page=${i}" data-fetch="${i}">${i}</a>`
            } else {
                output += '_'
            }
        }
        if (page < totalPage) {
            output += `<a href="/admin/${hash}?page=${
                +page + 1
            }" data-fetch="${+page + 1}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
            </a>`
        }
        output += '</div>'
        let _position = output.indexOf('_')
        let newPaginateHTML = ''

        while (_position !== -1) {
            newPaginateHTML += output.slice(0, _position)
            output = output.slice(_position)
            anchorPosition = output.indexOf('<')
            if (anchorPosition !== -1) {
                newPaginateHTML += '___'
                output = output.slice(anchorPosition)
                _position = output.indexOf('_')
            }
        }
        newPaginateHTML += output

        return newPaginateHTML
    },
}
