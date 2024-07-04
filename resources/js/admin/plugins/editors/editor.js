import {
    CONTAINER_CLASS,
    CUSTOM_EVENT_CONTENT_FILE,
    ERROR_INIT,
    PREFIX_BG_COLOR_CHECK,
    PREFIX_COLOR_CHECK,
} from './constants'
import { backRange, dispatchData } from './event'
import { rgbToHex } from './helper'
import { style } from './style'
import { toolbars } from './toolbar'

class EDITOR extends HTMLElement {
    constructor(callback) {
        super()
        // Báo ngay khi thiếu attribute
        if (!this.dataset.name) {
            console.error(ERROR_INIT)
            return false
        }
        this.arrayUsed = []
        this.listElements = null
        this.toolbars = {}
        this.init()
        this.savedRange
        this.selectionType
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
        container.className = CONTAINER_CLASS
        container.append(this.divToolbar, this.divContent)
        this.shadowRoot.append(container)
        this.addEventCatchAll()
        this.addEventSaveRanger()
        this.addEventCustomToolbar()
    }

    addEventCustomToolbar = () => {
        window.addEventListener(CUSTOM_EVENT_CONTENT_FILE, (e) => {
            const divContent = this.shadowRoot.querySelector('.content')
            if (divContent.dataset.id !== e.detail.uuid || divContent.dataset.type !== e.detail.type) return false
            backRange({shadowRoot: this.shadowRoot, range: this.savedRange, selectionType: this.selectionType})
            divContent.insertAdjacentHTML('beforeend',
                e.detail.files.map((file) => `<img src="/${JSON.parse(file).path_absolute}" alt="image">`).join('')
            )
            dispatchData(this.shadowRoot)
        })

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.shadowRoot.querySelector('.modal') && this.shadowRoot.querySelector('.modal').remove()
            }
        })
    }

    addEventSaveRanger = () => {
        this.shadowRoot.addEventListener('keyup', this.saveRangeFnc)
        this.shadowRoot.addEventListener('mouseup', this.saveRangeFnc)
    }

    saveRangeFnc = (e) => {
        // Kiểm tra nếu là toolbar thì không lưu range
        if (e.target.closest('.toolbar') || e.target.closest('.modal')) return false
        const selection = this.shadowRoot.getSelection()
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0)
            this.selectionType = selection.type;
        }
        dispatchData(this.shadowRoot)
    }

    

    setElementValue(obj, value, type) {
        if (type === 'color' || type === 'bg-color') {
            obj.element.value = value
        } else if (['font-size', 'heading'].includes(type)) {
            const indexOfSelect = obj.data.findIndex((size) => size === value)
            if (indexOfSelect != -1) {
                obj.element.selectedIndex = indexOfSelect
            }
        } else {
            obj.element.classList.add('active')
        }
    }

    addEventCatchAll = () => {
        this.shadowRoot.addEventListener('click', (e) => this.eventDetect(e))
        this.shadowRoot.addEventListener('keyup', (e) => this.eventDetect(e))
    }

    eventDetect = (e) => {
        // Cần kiểm tra trước thẻ
        if (e.target.closest('.toolbar') || e.target.closest('.modal')) return false
        this.arrayUsed = []
        const selection = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const container = range.startContainer
            let targetElement = container.nodeType === Node.TEXT_NODE ? container.parentNode : container
            this.listElements = this.getParentAndActive(targetElement, [])
            this.arrayUsed = this.listElements.reduce((arr, el) => {
                return [...arr,...this.detectAndActive(el)];
            },[])
            /*
                    1. Khớp type là button
                    2. Khớp data thì là select
                    3. Khớp bắt đầu với # thì là input color
                    Cần thêm link

                */
            // console.log(this.toolbars)
            // console.log(this.arrayUsed)
            for (const [type, obj] of Object.entries(this.toolbars)) {
                let checkActive = false
                let value = ''
                // Có thể là thẻ b hoặc bold
                if (type.includes('||')) {
                    const types = type.split('||')
                    for (let typeItem of types) {
                        if (!checkActive && this.arrayUsed.includes(typeItem)) {
                            checkActive = true
                            break
                        }
                    }
                } else if (this.arrayUsed.includes(type)) {
                    checkActive = true
                } else if (type === 'color') {
                    const indexNumber = this.arrayUsed.findIndex((el) => el.startsWith(PREFIX_COLOR_CHECK))
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = this.arrayUsed[indexNumber].replace(PREFIX_COLOR_CHECK,'')
                    }
                } else if (type === 'bg-color') {
                    const indexNumber = this.arrayUsed.findIndex((el) => el.startsWith(PREFIX_BG_COLOR_CHECK))
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = this.arrayUsed[indexNumber].replace(PREFIX_BG_COLOR_CHECK,'')
                        value = value.startsWith('rgb') ? rgbToHex(value) : value
                    }
                } else if (['font-size', 'heading'].includes(type)) {
                    const indexNumber = this.arrayUsed.findIndex((el) => !isNaN(+el))
                    if (indexNumber !== -1) {
                        checkActive = true
                        value = this.arrayUsed[indexNumber]
                    }
                }

                // Lưu lại dữ liệu
                if (checkActive) {
                    this.setElementValue(obj, value, type)
                } else {
                    switch (type) {
                        case 'color':
                            obj.element.value = '#000000'
                            break
                        case 'bg-color':
                            obj.element.value = '#ffffff'
                            break
                        case 'font-size':
                        case 'heading':
                            obj.element.selectedIndex = 0;
                            break;
                        default:
                            obj.element.classList.remove('active')
                            break
                    }
                }
            }
        }
    }

    detectAndActive(el) {
        // Kiểm tra textarea
        const localName = el.localName
        // Style
        const textAlign = el.style.textAlign
        const colorStyle = el.style.color ? PREFIX_COLOR_CHECK + el.style.color : null
        const fontWeight = el.style.fontWeight
        const fontStyle = el.style.fontSize
        const backgroundColor = el.style.backgroundColor
            ? PREFIX_BG_COLOR_CHECK + el.style.backgroundColor
            : null
        //Attribute
        const color = el.getAttribute('color')
            ? PREFIX_COLOR_CHECK + el.getAttribute('color')
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
        while (currentEl !== null && currentEl.closest('.content')) {
            arrEl.push(currentEl)
            currentEl = currentEl.parentElement
        }
        return arrEl
    }

    styles() {
        const toolbarStyles = new CSSStyleSheet()
        toolbarStyles.replaceSync(style)
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
                    const selectEl = document.createElement('select')
                    this.toolbars[data.name] = {
                        element: selectEl,
                        data: [],
                    }
                    for (const tool of data.tools) {
                        const option = document.createElement('option')
                        option.value = tool.value
                        option.innerHTML = tool.html
                        selectEl.append(option)
                        // Thêm các biên vào đây
                        this.toolbars[data.name].data.push(tool.check)
                    }
                    this.addEventToolbar(data, selectEl, undefined, true)
                    toolbar.append(selectEl)
                    break
                case 'color':
                case 'bg-color':
                    const colorInput = document.createElement('input')
                    colorInput.type = 'color'
                    toolbar.append(colorInput)
                    this.addEventToolbar(data, colorInput, undefined, true)
                    this.toolbars[data.type] = {
                        element: colorInput,
                    }
                    break
                case 'insertImage':
                    const divImage = this.addToolbar(toolbar, data);
                    this.addEventToolbar(data, divImage);
                    break
                case 'createLink':
                    const divLink = this.addToolbar(toolbar, data);
                    this.addEventToolbar(data, divLink);
                    data.check && (this.toolbars[data.check] = {element: divLink})
                    break
                default:
                    for (const tool of data.tools) {
                        const button = document.createElement('button')
                        button.innerHTML = tool.html
                        button.setAttribute('tooltip', tool.html)
                        toolbar.append(button)
                        this.addEventToolbar(data, button, tool.value);
                        tool.check && (this.toolbars[tool.check] = { element: button})
                    }
                    break
            }
            divToolbar.append(toolbar)
        }
        return divToolbar
    }

    addToolbar(toolbar, data){
        const element = document.createElement('div')
        element.className = data.type
        element.innerHTML = data.html
        toolbar.append(element)
        return element;
    }
    addEventToolbar(data, element, value = null, isElementValue = false){
        for (const [even, func] of Object.entries(data.events)) {
            element[even] = (e) => {
                e.stopPropagation()
                const params = {
                    event: e,
                    value: isElementValue ? element.value : value,
                    cmsEditor: this,
                    shadowRoot: this.shadowRoot,
                    range: this.savedRange,
                    selectionType: this.selectionType,
                    element,
                    cmd: data.cmd
                }
                func(params)
            }
        }
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
