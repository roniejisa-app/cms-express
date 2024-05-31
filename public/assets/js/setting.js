import MODAL from './modal.js'
import request from './request.js'
import notify from './notify.js'
;(() => {
    const formUpdateSetting = document.querySelector('.setting-form')
    const formAddSetting = document.querySelector('.form-add-setting')
    if (!formUpdateSetting) return

    formAddSetting.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = Object.fromEntries([...new FormData(e.target)])
        const { data } = request.post('/admin/settings', formData)
        if (data) {
            console.log(data)
            notify.success(
                'Thêm cài đặt thành công. Vui lòng tải lại trang để xem thay đổi'
            )
        }
    })

    formUpdateSetting.addEventListener('submit', (e) => {
        e.preventDefault()
        e.preventDefault()

        // Get all form elements
        const formElements = e.target.elements

        // Filter form elements to only include those with data-changed attribute
        const changedElements = Array.from(formElements).filter(
            (element) => !element.hasAttribute('data-changed')
        )

        // Create an array of entries (name, value) for the changed elements
        const changedEntries = changedElements.map((element) => [
            element.name,
            element.value,
        ])

        // Convert the array of entries to an object
        const formData = Object.fromEntries(changedEntries)
        console.log(formData)
        // const formData = Object.fromEntries([...new FormData(e.target)])
        // const { data } = request.patch('/admin/settings', formData)
        // if (data) {
        //     console.log(data)
        //     notify.success(
        //         'Lưu thay đổi cài đặt. Vui lòng tải lại trang để xem thay đổi'
        //     )
        // }
    })
   
    const handleChange = function(){
        console.log(this);
    }
    for(const key in formUpdateSetting.elements){
        if(key.length >= 20){
            formUpdateSetting.elements[key].onchange = handleChange
            formUpdateSetting.elements[key].oninput = handleChange
            formUpdateSetting.elements[key].onclick = handleChange
            formUpdateSetting.elements[key].onpaste = handleChange
        }
    }
})()
