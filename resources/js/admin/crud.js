import request from '../utils/request'
import { toKebabCase } from '../utils/support'
import { urlEndpoint } from './../config'
import notify from './../utils/notify'
const CRUD = (() => {
    const idEl = document.querySelector('[data-id]')

    const listTypes = document.querySelectorAll('[type-input]')
    let inputTimer = {}
    let oldValue = {}
    listTypes.forEach((inputEl, index) => {
        oldValue[index] = inputEl.value
        inputEl.oninput = ({ target }) => {
            clearTimeout(inputTimer[index])
            inputTimer[index] = setTimeout(async () => {
                const dataValue = toKebabCase(target.value)
                const objData = {
                    value: dataValue,
                }

                if (idEl) {
                    objData.id = idEl.dataset.id
                }
                request.setEndpoint(urlEndpoint, objData)
                const { data } = await request.post(
                    `/admin/check-link`,
                    objData
                )
                if (data.message) {
                    notify.error(data.message)
                    inputEl.value = oldValue[index]
                    return false
                }
            }, 500)
        }
    })
})()
export default CRUD
