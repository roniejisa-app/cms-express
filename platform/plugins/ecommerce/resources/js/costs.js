import { getNumber } from "../../../../../resources/js/utils/utils"

class SaleCost {
    constructor(el) {
        this.el = el
        this.elTextArea = this.el.querySelector('textarea')
        this.data = []
        this.init()
    }

    pasteEvent() {
        this.el.addEventListener('paste', (event) => {
            // Ngăn chặn hành động dán mặc định của trình duyệt
            event.preventDefault()
            // Lấy dữ liệu từ clipboard
            const clipboardData = event.clipboardData || window.clipboardData
            const pastedData = clipboardData.getData('Text')

            // Chia dữ liệu thành từng dòng
            const rows = pastedData.trim().split('\n')

            // Duyệt qua từng dòng và chia thành các ô
            rows.forEach((row, index) => {
                const cells = row.split('\t') // Giả sử dữ liệu được tách bằng tab
                this.items.append(this.instanceItem(cells[0], cells[1]))
            })
            this.updateTextArea()
        })
    }
    instanceItem(name = null, value = null) {
        const item = document.createElement('div')
        item.setAttribute('cost-item', '')
        const costName = document.createElement('input')
        costName.setAttribute('cost-name', '')
        costName.placeholder = 'Chi phí cho...'
        if (name) {
            costName.value = name
        }
        const costValue = document.createElement('input')
        costValue.setAttribute('cost-value', '')
        costValue.placeholder = 'Giá trị...'
        if (value) {
            costValue.value = getNumber(value);
        }
        const costType = document.createElement('select')
        costType.setAttribute('cost-type', '')
        costType.innerHTML = `<option value="percent">%</option>
                                <option value="number">Số</option>`
        const deleteButton = document.createElement('button')
        deleteButton.type="button";
        deleteButton.innerHTML = 'Xóa'
        deleteButton.onclick = () => {
            item.remove();
            this.updateTextArea();
        }
        item.append(costName, costValue, costType, deleteButton)
        return item
    }

    updateTextArea() {
        this.items = this.el.querySelector('[costs]')
        this.data = []
        for (const itemCost of this.items.children) {
            const costName = itemCost.querySelector('[cost-name]')
            const costValue = itemCost.querySelector('[cost-value]')
            const costType = itemCost.querySelector('[cost-type]')
            this.data.push({
                name: costName.value,
                value: costValue.value,
                type: costType.value,
            })
        }
        this.elTextArea.innerHTML = JSON.stringify(this.data)
    }

    init() {
        this.pasteEvent()
        this.items = this.el.querySelector('[costs]')
        this.buttonAddCost = this.el.querySelector('[add-cost]')
        this.buttonAddCost.onclick = () => {
            this.items.append(this.instanceItem())
        }
    }
}

const saleCost = document.querySelectorAll('[sale-cost]')
saleCost.forEach((cost) => {
    const saleCost = new SaleCost(cost)
})
