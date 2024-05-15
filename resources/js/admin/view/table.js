import { rsLoading } from '../../utils/template.js'
import CHECKBOX from './checkbox.js'
import FILTER from './filter.js'
import PAGINATION from './pagination.js'
import request from './../../utils/request.js'
import { urlEndpoint } from '../../config.js'

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
                                    console.log(data, value)
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
                    'position:absolute;width:100%;height:100%;top:0;background:rgba(0,0,0,<div className="3"></div>)'
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
            typeof FILTER.init === 'function' && FILTER.init()
            typeof CHECKBOX.init === 'function' && CHECKBOX.init()
            typeof PAGINATION.init === 'function' && PAGINATION.init()
        },
    }
})()
export default TABLE
