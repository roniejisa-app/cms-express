import LOADING from '../../../../../resources/js/admin/layouts/loading'
import request from '../../../../../resources/js/utils/request'
const WORD_EDITOR = (() => {
    request.setEndpoint(import.meta.env.VITE_BU + import.meta.env.VITE_AP)
    const selectLanguage = document.querySelector('.i18n-form select')
    const table = document.querySelector('.table-data tbody')
    selectLanguage.onchange = async () => {
        console.log(selectLanguage.value)
        LOADING.show()
        const {
            data: { data },
            response,
        } = await request.post('/words', {
            lang: selectLanguage.value,
        })
        renderTable(data)
        LOADING.hide()
        editTable()
    }
    function renderTable(data) {
        table.innerHTML = ''
        for (const [key, value] of Object.entries(data)) {
            table.innerHTML += `
                <tr>
                    <td>${key}</td>
                    <td data-key="${key}">${value}</td>
                </tr>
            `
        }
    }
    function editTable() {
        for (const td of table.querySelectorAll('td:nth-child(2)')) {
            td.ondblclick = (e) => {
                if (td.querySelector('input')) return
                console.log('hehe')
                const key = td.dataset.key
                const oldData = td.innerText
                td.innerHTML = `
                    <form class="form-edit-word">
                        <input type="text" value="${oldData}"/>
                        <button>Lưu</button>  
                        <button type="reset">Reset</button>
                    </form>
                `
                const form = td.querySelector('.form-edit-word')
                form.onsubmit = async (e) => {
                    e.preventDefault()
                    const newData = form.querySelector('input').value;
                    if(newData.trim() === oldData) {
                        return td.innerText = oldData
                    }
                    const { data, response } = await request.patch('/words', {
                        lang: selectLanguage.value,
                        key,
                        value: newData,
                    })
                    if(response.ok){
                        td.innerText = newData
                    }
                }
            }
        }
    }

    function filter() {

    }

    editTable()
})()
