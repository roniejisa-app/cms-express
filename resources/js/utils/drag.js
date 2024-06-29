class DragField {
    constructor(box, contentEl, closestClass) {
        this.box = box
        this.items = box.children
        this.contentEl = contentEl
        this.itemDrag = null
        this.closestClass = closestClass
    }

    init() {
        this.box.setAttribute('draggable', 'true')
        for (let item of this.items) {
            item.ondragstart = (e) => {
                console.log(e)
                this.itemDrag = item
            }
        }
        document.ondragover = (e) => {
            e.preventDefault()
        }

        this.box.ondragover = (e) => {
            const itemTarget = e.target.closest(this.closestClass)
            if (itemTarget) {
                const rate = itemTarget.offsetWidth / 2
                if (e.offsetX > rate) {
                    itemTarget.parentElement.insertBefore(
                        itemTarget,
                        this.itemDrag
                    )
                } else if (e.offsetX <= rate) {
                    itemTarget.parentElement.insertBefore(
                        this.itemDrag,
                        itemTarget
                    )
                }
            }
        }

        this.box.ondragend = (e) => {
            this.itemDrag = null
            const dataContent = this.contentEl.innerText
            const obj = JSON.parse(dataContent)
            this.items = this.box.children
            const newObj = []
            for (let item of this.items) {
                const id = item.dataset.id
                const index = obj.findIndex((item) => {
                    const dataItem = JSON.parse(item)
                    return dataItem.uniqueId === id
                })
                if (index !== -1) {
                    newObj.push(obj[index])
                }
            }
            this.contentEl.innerText = JSON.stringify(newObj)
        }
    }
}

export default DragField
