import { dispatchData } from './event'
import { toolbars } from './toolbar'
class EDITOR extends HTMLElement {
    constructor(callback) {
        super()
        // Báo ngay khi thiếu attribute
        if (!this.dataset.name) {
            console.error(
                'Vui lòng thêm thuộc tính data-name riêng biệt vào thẻ cms-editor 🤣'
            )
            return false
        }
        this.toolbars = {}
        this.init()
        this.savedRange
        if (typeof callback === 'function') {
            callback(this)
        }
    }

    init() {
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.adoptedStyleSheets = this.styles()
        this.divToolbar = this.initToolbar()
        this.divContent = this.initContent()
        // Tạo một bảng thêm tất cả các toolbar vào khi click kiểm tra thuộc mảng thì active lên
        const container = document.createElement('div')
        container.className = 'container'
        container.append(this.divToolbar, this.divContent)
        this.shadowRoot.append(container)
        this.addEventCatchAll()
        this.addEventSaveRanger()
    }

    addEventSaveRanger = () => {
        this.shadowRoot.addEventListener('keyup', this.saveRange)
        this.shadowRoot.addEventListener('mouseup', this.saveRange)
    }

    saveRange = () => {
        const selection = this.shadowRoot.getSelection()
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0)
        }
        dispatchData(this.shadowRoot)
    }

    eventClick = () => {
        // Cần kiểm tra trước thẻ
        const selection = this.shadowRoot.getSelection
            ? this.shadowRoot.getSelection()
            : window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const container = range.startContainer
            let targetElement

            if (container.nodeType === Node.TEXT_NODE) {
                targetElement = container.parentNode
            } else {
                targetElement = container
            }
            const listElements = this.getParentAndActive(targetElement, [])
            let arrCheck = []
            listElements.forEach((el) => {
                arrCheck = [...arrCheck, ...this.detectAndActive(el)]
            })
            // console.log(this.toolbars)
            // console.log(arrCheck)
            /*
                    1. Khớp type là button
                    2. Khớp data thì là select
                    3. Khớp bắt đầu với # thì là input color

                    Cần thêm link

                */
            for (const [type, obj] of Object.entries(this.toolbars)) {
                let checkActive = false
                let value = ''

                // Có thể là thẻ b hoặc bold
                if (type.includes('||')) {
                    const types = type.split('||')
                    for (let typeItem of types) {
                        if (!checkActive && arrCheck.includes(typeItem)) {
                            checkActive = true
                            break
                        }
                    }
                } else if (arrCheck.includes(type)) {
                    checkActive = true
                } else if (
                    type === 'color' &&
                    arrCheck.some(
                        (el) => el.startsWith('#') || el.startsWith('rgb')
                    )
                ) {
                    const indexNumber = arrCheck.findIndex((el) =>
                        el.startsWith('#')
                    )
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = arrCheck[indexNumber]
                    }
                } else if (type === 'select') {
                    const indexNumber = arrCheck.findIndex((el) => !isNaN(+el))
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = arrCheck[indexNumber]
                    }
                }
                if (checkActive) {
                    if (type === 'color') {
                        obj.element.value = value
                    } else if (type === 'select') {
                        // console.log(obj)
                        const indexOfSelect = obj.data.findIndex(
                            (size) => size === value
                        )
                        if (indexOfSelect != -1) {
                            obj.element.selectedIndex = indexOfSelect
                        }
                    } else {
                        obj.element.classList.add('active')
                    }
                } else {
                    if (type === 'color') {
                        obj.element.value = '#000000'
                    } else if (type === 'select') {
                        obj.element.selectedIndex = 0
                    } else {
                        obj.element.classList.remove('active')
                    }
                }
            }
        }
    }

    addEventCatchAll = () => {
        this.shadowRoot.addEventListener('click', () => this.eventClick())
    }

    detectAndActive(el) {
        // Kiểm tra textarea
        const localName = el.localName
        // Style
        const textAlign = el.style.textAlign
        const colorStyle = el.style.color
        const fontWeight = el.style.fontWeight
        //Attribute
        const color = el.getAttribute('color')
        const size = el.getAttribute('size')
        return [
            textAlign,
            localName,
            color,
            size,
            colorStyle,
            fontWeight,
        ].filter((item) => item)
    }

    getParentAndActive(targetElement, arrEl) {
        let currentEl = targetElement
        while (!currentEl.classList.contains('content')) {
            arrEl.push(currentEl)
            currentEl = currentEl.parentElement
        }
        return arrEl
    }

    styles() {
        const toolbarStyles = new CSSStyleSheet()
        toolbarStyles.replaceSync(`
            *{
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                max-width: 100%;
            }

            ol, ul {
                padding-left: 1.5em;
            }

            .container{
                max-height: 600px;
                position: relative;
                overflow: auto;
                box-shadow: rgb(231, 231, 231) 0px 0px 0px 0.1em inset;
                border-radius: 6px;
                padding-bottom: 20px;
            }
            .toolbar {
                display: flex;
                align-items: center;
                padding: 10px;
                gap: 12px;
                flex-wrap: wrap;
                position: sticky;
                top: 0;
                left: 0;
                background: white;
                box-shadow: rgb(231, 231, 231) 0px 0px 0px 0.1em inset;
                border-radius: 6px;
            }
            .toolbar-group{
                display: flex;
                gap: 2px;
            }
            .toolbar select{
                border: none;
                background: none;
                border-radius: 6px;
                border: 1px solid #ccc;
                padding: 3px 5px;
            }
            .toolbar button {
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 6px;
                padding: 3px 5px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .toolbar button.active svg{
                fill: var(--color-main);
                color: var(--color-main);
            }
            .toolbar button svg {
                width: 14px;
                height: 14px;
            }
            .content{
                word-break: break-word;
                min-height: 200px;
                outline: none;
                padding-bottom:30px;
                border-radius: 6px;
                padding:12px 15px;
            }
        `)
        return [toolbarStyles]
    }
    // Print Toolbar
    initToolbar() {
        const divToolbar = document.createElement('div')
        divToolbar.className = 'toolbar'
        for (const [className, data] of Object.entries(toolbars)) {
            const toolbar = document.createElement('div')
            toolbar.className = className + ' toolbar-group'
            switch (data.type) {
                case 'select':
                    const select = document.createElement('select')
                    this.toolbars[data.type] = {
                        element: select,
                        data: [],
                    }
                    for (const tool of data.tools) {
                        const option = document.createElement('option')
                        option.value = tool.value
                        option.innerHTML = tool.html
                        select.append(option)
                        // Thêm các biên vào đây
                        this.toolbars[data.type].data.push(tool.check)
                    }
                    for (const [even, func] of Object.entries(data.events)) {
                        select[even] = (e) =>
                            func(
                                e,
                                select.value,
                                select,
                                this.shadowRoot,
                                this.savedRange
                            )
                    }
                    toolbar.append(select)
                    break
                case 'color':
                    const color = document.createElement('input')
                    color.type = 'color'
                    for (const [even, func] of Object.entries(data.events)) {
                        color[even] = (e) => {
                            func(
                                e,
                                color.value,
                                color,
                                this.shadowRoot,
                                this.savedRange
                            )
                        }
                    }
                    toolbar.append(color)
                    this.toolbars[data.type] = {
                        element: color,
                    }
                    break
                default:
                    for (const tool of data.tools) {
                        const button = document.createElement('button')
                        button.innerHTML = tool.html

                        button.setAttribute('tooltip', tool.html)
                        for (const [even, func] of Object.entries(
                            data.events
                        )) {
                            button[even] = (e) => {
                                func(
                                    e,
                                    tool.value,
                                    button,
                                    this.shadowRoot,
                                    this.savedRange
                                )
                            }
                        }
                        toolbar.append(button)
                        tool.check &&
                            (this.toolbars[tool.check] = {
                                element: button,
                            })
                    }
                    break
            }
            divToolbar.append(toolbar)
        }
        return divToolbar
    }
    initContent() {
        const divContent = document.createElement('div')
        divContent.className = 'content'
        divContent.setAttribute('contenteditable', true)
        divContent.innerHTML = this.innerHTML
        divContent.setAttribute('data-name', this.dataset.name)
        return divContent
    }
    connectedCallback() {
        // console.log('EDITOR bắt đầu')
    }
    disconnectedCallback() {
        // console.log('Loại bỏ khỏi DOM')
    }
    attributeChangeCallback(name, oldValue, newValue) {
        // console.log('Thay đổi thuộc tiêu:', name, oldValue, newValue)
    }
}

customElements.define('cms-editor', EDITOR)
export default EDITOR
