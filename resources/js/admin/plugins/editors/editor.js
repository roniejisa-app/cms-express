import { dispatchData } from './event'
import { toolbars } from './toolbar'
function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);

        hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
}

function componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
        Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}
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
            //console.log(this.toolbars)
            //console.log(arrCheck)
            /*
                    1. Khớp type là button
                    2. Khớp data thì là select
                    3. Khớp bắt đầu với # thì là input color

                    Cần thêm link

                */
            // console.log(this.toolbars)
            console.log(arrCheck)
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
                    arrCheck.some((el) => el.startsWith('color||'))
                ) {
                    const indexNumber = arrCheck.findIndex((el) =>
                        el.startsWith('color||')
                    )
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = arrCheck[indexNumber].replace('color||', '')
                    }
                } else if (
                    type === 'bg-color' &&
                    arrCheck.some((el) => el.startsWith('bg-color||'))
                ) {
                    const indexNumber = arrCheck.findIndex((el) =>
                        el.startsWith('bg-color||')
                    )
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = arrCheck[indexNumber].replace('bg-color||', '')
                        value = value.startsWith('rgb') ? rgbToHex(value) : value;
                    }
                } else if (['font-size', 'heading'].includes(type)) {
                    const indexNumber = arrCheck.findIndex((el) => !isNaN(+el))
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = arrCheck[indexNumber]
                    }
                }
                if (checkActive) {
                    if (type === 'color') {
                        obj.element.value = value;
                    } else if (type === 'bg-color') {
                        obj.element.value = value;
                    } else if (['font-size', 'heading'].includes(type)) {
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
                    } else if (type === 'bg-color') {
                        obj.element.value = 'transparent'
                    } else if (['font-size', 'heading'].includes(type)) {
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
        const colorStyle = el.style.color ? 'color||' + el.style.color : null
        const fontWeight = el.style.fontWeight
        const fontStyle = el.style.fontSize
        const backgroundColor = el.style.backgroundColor
            ? 'bg-color||' + el.style.backgroundColor
            : null
        //Attribute
        const color = el.getAttribute('color')
            ? 'color||' + el.getAttribute('color')
            : null
        const size = el.getAttribute('size')
        return [
            textAlign,
            localName,
            color,
            size,
            colorStyle,
            fontWeight,
            fontStyle,
            backgroundColor,
        ].filter((item) => item)
    }

    getParentAndActive(targetElement, arrEl) {
        let currentEl = targetElement
        while (!currentEl || !currentEl.classList.contains('content')) {
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
                border: 1px solid #ffffff; 
                transition: border-color 300ms ease, background-color 300ms ease;
            }
            .toolbar button.active{
                border-color: var(--color-main);
            }
            
            .toolbar button.active svg{
                fill: var(--color-main);
            }

            .toolbar button svg {
                transition: fill 300ms ease;
                width: 1rem;
                height: 1rem;
            }
            .content{
                word-break: break-word;
                min-height: 200px;
                outline: none;
                padding-bottom:30px;
                border-radius: 6px;
                padding:12px 15px;
            }
            input[type="color"]{
                background: none;
                border: none;
                max-width: 24px;
                min-height: 24px;
                cursor: pointer;
            }
            
            input[type="color" i]::-webkit-color-swatch {
                border-radius: 50%;
            }
        `)
        return [toolbarStyles]
    }
    // Print Toolbar
    initToolbar() {
        const divToolbar = document.createElement('div')
        divToolbar.className = 'toolbar'
        for (const [className, data] of Object.entries(toolbars)) {
            if (data.hidden) continue
            const toolbar = document.createElement('div')
            toolbar.className = className + ' toolbar-group'
            switch (data.type) {
                case 'select':
                    const select = document.createElement('select')
                    this.toolbars[data.name] = {
                        element: select,
                        data: [],
                    }
                    for (const tool of data.tools) {
                        const option = document.createElement('option')
                        option.value = tool.value
                        option.innerHTML = tool.html
                        select.append(option)
                        // Thêm các biên vào đây
                        this.toolbars[data.name].data.push(tool.check)
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
                case 'bg-color':
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
