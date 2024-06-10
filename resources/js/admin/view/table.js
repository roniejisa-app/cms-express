import { rsLoading } from '../../utils/template'
import CHECKBOX from './checkbox'
import FILTER from './filter'
import PAGINATION from './pagination'
import request from './../../utils/request'
import { urlEndpoint } from '../../config'
import LOADING from '../layouts/loading'
import XHR from '../../utils/xhr'
import notify from '../../utils/notify'
const TABLE = (() => {
    const tableDataEl = document.querySelector('.table-data')
    const limitEl = document.querySelector('.sort-show-filter [data-limit]')
    const sortEl = document.querySelector('.sort-show-filter [data-sort]')
    let filterBody = {}
    function searchInputDefault() {
        let searchFormInput = document.querySelector('.search-form input')
        if (!searchFormInput) return
        let searchFormTimer
        searchFormInput.oninput = () => {
            clearTimeout(searchFormTimer)
            searchFormTimer = setTimeout(() => {
                const { name, value } = searchFormInput
                TABLE.filter(
                    {
                        field: name,
                        type: 'contains',
                        value,
                    },
                    true
                )
            }, 500)
        }
    }

    if (limitEl) {
        limitEl.onchange = () => TABLE.filter({}, true)
    }
    if (sortEl) {
        sortEl.onchange = () => TABLE.filter({}, true)
    }

    function importExcel() {
        const importExcelForm = document.querySelector('.import-excel-form')
        if (!importExcelForm) return
        importExcelForm.onclick = () => {
            const inputFile = document.createElement('input')
            inputFile.type = 'file'
            inputFile.click()
            inputFile.onchange = async (e) => {
                const file = e.target.files[0]
                const module = importExcelForm.dataset.module
                LOADING.show()
                XHR.setType('formData')
                const data = await XHR.post(
                    `${urlEndpoint}/admin/${module}/import-excel`,
                    {
                        file,
                    }
                )
                LOADING.hide()
                notify.success(data.message)
            }
        }
    }

    function chooseBelongsToMany() {
        const elements = document.querySelectorAll('[belongs-to-many]')
        for (const element of elements) {
            const checkEls = element.querySelectorAll('input[type="checkbox"]')
            for (const inputCheckbox of checkEls) {
                inputCheckbox.onchange = (e) => {
                    if (inputCheckbox.checked) {
                        // Click vào chat thì hủy hết con
                        const value = inputCheckbox.value
                        const listParent = getValueCheckboxParent(inputCheckbox);
                        for (const parent of listParent) {
                            const inputCheckbox = Array.from(checkEls).find(el => {
                                return +el.value === +parent && !el.checked;
                            });
                            if(inputCheckbox){
                                inputCheckbox.checked = true;
                            }
                        }
                    } else {
                        // Kiểm tra lấy tất cả con
                        element.querySelectorAll(`[child-of="${inputCheckbox.value}"] input:checked`).forEach((el) => {
                            el.checked = false;
                        })
                    }
                }
            }
        }
    }

    function getValueCheckboxParent(element) {
        let listValueCheckbox = []
        let parentElement = element.closest(`[child-of]`)
        while (parentElement) {
            listValueCheckbox.push(parentElement.getAttribute('child-of'))
            parentElement = parentElement.previousElementSibling.closest(`[child-of]`);
        }
        return listValueCheckbox
    }

    return {
        filter: async (data, useOldData = false) => {
            if (useOldData) {
                let indexDuplicate = null
                let index = 0
                for (const [name, value] of Object.entries(data)) {
                    const oldData = filterBody[name]
                    if (oldData) {
                        if (Array.isArray(oldData)) {
                            if (!indexDuplicate && index === 0) {
                                indexDuplicate = oldData.findIndex((data) => {
                                    return data === value
                                })
                            }
                            if (
                                indexDuplicate != -1 &&
                                indexDuplicate != null
                            ) {
                                filterBody[name].splice(indexDuplicate, 1)
                            }
                            filterBody[name].push(value)
                        } else {
                            filterBody[name] = value
                        }
                    } else {
                        if (['type', 'field', 'value'].includes(name)) {
                            filterBody[name] = [value]
                        } else {
                            filterBody[name] = value
                        }
                    }
                    index++
                }
            } else {
                filterBody = data
            }
            filterBody = {
                ...filterBody,
                limit: limitEl.value,
            }

            if (sortEl) {
                filterBody.sort = sortEl.dataset.for
                filterBody.sortType = sortEl.value
            }

            tableDataEl.insertAdjacentHTML(
                'beforeend',
                `${rsLoading(
                    'position:absolute;width:100%;height:100%;top:0;background:var(--color-main))'
                )}`
            )
            request.setEndpoint(urlEndpoint)
            const response = await request.post(
                `/admin/${tableDataEl.dataset.module}/filter`,
                filterBody
            )
            tableDataEl.innerHTML = response.data.html
            TABLE.init()
        },
        init: () => {
            searchInputDefault()
            importExcel()
            chooseBelongsToMany()
            typeof FILTER.init === 'function' && FILTER.init()
            typeof CHECKBOX.init === 'function' && CHECKBOX.init()
            typeof PAGINATION.init === 'function' && PAGINATION.init()
        },
    }
})()
export default TABLE
