import notify from './../../utils/notify.js'
import request from './../../utils/request.js'
import { urlEndpoint } from './../../config.js'
import TABLE from './table.js'
const CHECKBOX = (() => {
    function start() {
        const checkboxAll = document.querySelector('.check-all input')
        if (!checkboxAll) return
        const { parentElement: labelCheckboxAll } = checkboxAll

        const checkboxAction = document.querySelector('.checkbox-action')
        const btnCheckboxAction = checkboxAction.querySelector('button')
        const listAction = checkboxAction.querySelector('ul')
        const checkboxSingles = document.querySelectorAll('.check-single input')
        let countCheck = 0
        function handleCheckboxAll({ target: { checked } }) {
            for (const inputSingle of checkboxSingles) {
                inputSingle.checked = checked
            }
            countCheck = checked ? checkboxSingles.length : 0
            checked && removeNotFull()
        }
        checkboxAll.onchange = handleCheckboxAll

        function handleCheckboxSingle({ target: { checked } }) {
            if (checked) {
                countCheck++
            } else {
                countCheck--
            }
            if (countCheck >= 1) {
                if (countCheck === checkboxSingles.length) {
                    removeNotFull()
                    checkboxAll.checked = true
                } else {
                    labelCheckboxAll.classList.add('not-full')
                    checkboxAll.checked = false
                }
            } else {
                removeNotFull()
                checkboxAll.checked = false
            }
        }

        function removeNotFull() {
            if (labelCheckboxAll.classList.contains('not-full')) {
                labelCheckboxAll.classList.remove('not-full')
            }
        }

        for (const inputSingle of checkboxSingles) {
            inputSingle.onchange = handleCheckboxSingle
        }

        btnCheckboxAction.onclick = () => {
            checkboxAction.classList.toggle('show')
        }
        for (const action of listAction.children) {
            action.onclick = async (e) => {
                e.stopPropagation()
                const dataValues = getDataChecked()
                const type = action.dataset.type
                if (!dataValues.length) {
                    notify.error('Vui lòng chọn ít nhất 1 hàng!')
                    return false
                }

                switch (type) {
                    case 'delete':
                        request.setEndpoint(urlEndpoint)
                        const { status, data } = await request.post(
                            `/admin/${checkboxAction.dataset.module}/delete-multiple`,
                            {
                                ids: dataValues,
                            }
                        )
                        if (status === 'OK') {
                            notify.success(data.message)
                            TABLE.filter({}, true)
                        }
                        break
                }
            }
        }

        function getDataChecked() {
            return Array.from(checkboxSingles)
                .filter((input) => input.checked)
                .map(({ value }) => value)
        }

        document.addEventListener('click', (e) => {
            if (
                !e.target.closest('.checkbox-action') &&
                checkboxAction.classList.contains('show')
            ) {
                checkboxAction.classList.remove('show')
            }
        })
    }
    return {
        init: () => start(),
        reload: () => start(),
    }
})()
export default CHECKBOX
