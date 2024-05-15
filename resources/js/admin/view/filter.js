import TABLE from './table'

const FILTER = (() => {
    function start() {
        const btnFilter = document.querySelector('.btn-filter')
        if (!btnFilter) return false
        const filterBox = document.querySelector('.filter-box')
        const filterForm = filterBox.querySelector('form')
        const overlayFilter = filterBox.querySelector('.overlay')
        const filterList = filterBox.querySelector('.filter-list');
        const closeFilter = filterBox.querySelector('.close-filter');
        const filterItemClone = filterList.firstElementChild.cloneNode(true)
        const btnAddFilter = filterBox.querySelector('[type="button"]')

        function toggleFilter() {
            filterBox.classList.toggle('show')
        }
        function addFilterItem() {
            const removeBtn = document.createElement('button')
            removeBtn.classList.add('btn', 'btn-danger')
            removeBtn.type = 'button'
            removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>`
            const newItemFilter = filterItemClone.cloneNode(true)
            newItemFilter.append(removeBtn)
            filterList.append(newItemFilter)
            removeBtn.onclick = () => newItemFilter.remove()
        }
        let timerForm = null
        filterForm.onsubmit = async (e) => {
            e.preventDefault()
            clearTimeout(timerForm)
            timerForm = setTimeout(() => {
                const formData = Array.from(filterList.children).reduce(
                    (formData, filterItem) => {
                        const listData = filterItem.querySelectorAll('[name]')
                        listData.forEach((item) => {
                            if (!formData[item.name]) {
                                formData[item.name] = []
                            }
                            formData[item.name].push(item.value)
                        })
                        return formData
                    },
                    {}
                )
                TABLE.filter(formData)
            }, 300)
        }
        btnAddFilter.onclick = addFilterItem
        overlayFilter.onclick = toggleFilter
        btnFilter.onclick = toggleFilter
        closeFilter.onclick = toggleFilter
    }
    return {
        init: () => start(),
        reload: () => start(),
    }
})()
export default FILTER
