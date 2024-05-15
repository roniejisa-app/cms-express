import TABLE from './table'

const PAGINATION = (() => {
    function start() {
        const paginates = document.querySelectorAll('[data-fetch]')
        for (const paginateEl of paginates) {
            paginateEl.onclick = (e) => {
                e.preventDefault()
                const page = paginateEl.getAttribute('data-fetch')
                TABLE.filter({ page }, true)
            }
        }
    }

    return {
        init: () => start(),
    }
})()

export default PAGINATION
