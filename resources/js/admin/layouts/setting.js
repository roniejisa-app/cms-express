import MODAL from './modal.js'
import TAB from './tab.js'
import MENU from './menu.js'
import notify from './../../utils/notify.js'
import LOADING from './loading.js'
import request from './../../utils/request.js'
import TOOLTIP from './tooltip.js'
const SETTING = (() => {
    function init() {
        const formUpdateSetting = document.querySelector('.setting-form')
        const formAddSetting = document.querySelector('.form-add-setting')
        if (!formUpdateSetting) return
        let dataStarts = {}
        formAddSetting.addEventListener('submit', async (e) => {
            e.preventDefault()
            LOADING.show(formAddSetting)
            const formData = Object.fromEntries([...new FormData(e.target)])
            const { data, error } = await request.post(
                import.meta.env.VITE_AP+'/settings',
                formData
            )
            LOADING.hide(formAddSetting)
            if (data) {
                e.target.reset()
                notify.success(
                    'Thêm cài đặt thành công. Vui lòng tải lại trang để xem thay đổi'
                )
            } else {
                notify.error(error.message)
            }
        })

        formUpdateSetting.addEventListener('submit', async (e) => {
            e.preventDefault()

            // Get all form elements
            const formElements = e.target.elements

            // Filter form elements to only include those with data-changed attribute
            const changedElements = Array.from(formElements).filter((element) =>
                element.hasAttribute('data-changed')
            )

            // Create an array of entries (name, value) for the changed elements
            const changedEntries = changedElements.map((element) => [
                element.name,
                element.value,
            ])
            if (changedEntries.length === 0) {
                notify.error('Không có giá trị nào thay đổi!')
                return false
            }
            // Convert the array of entries to an object
            const formData = Object.fromEntries(changedEntries)

            // const formData = Object.fromEntries([...new FormData(e.target)])
            LOADING.show(formUpdateSetting)
            const { data, error } = await request.patch(
                import.meta.env.VITE_AP+'/settings',
                formData
            )
            LOADING.hide(formUpdateSetting)

            if (data) {
                notify.success(data.message)
                updateElement()
            } else {
                console.log(error)
            }
        })

        function updateElement() {
            for (const key in formUpdateSetting.elements) {
                if (key.length >= 20) {
                    const el = formUpdateSetting.elements[key]
                    dataStarts[el.name] = el.value || el.innerText
                    formUpdateSetting.elements[key].onchange = handleChange
                    el.removeAttribute('data-changed')
                }
            }
        }
        // Theo dõi hành động của các thẻ trong setting có thay đổi thì mới update
        const handleChange = function () {
            const valueCurrent = this.value || this.innerText
            if (dataStarts[this.name] !== valueCurrent) {
                this.setAttribute('data-changed', 'true')
            }
        }

        updateElement()
    }
    return {
        init: () => init(),
    }
})()
window.addEventListener('DOMContentLoaded', function () {
    MENU.init()
    MODAL.init()
    TAB.init()
    TOOLTIP.init()
})
export default SETTING
