import MEDIA from '../../media'
export const eventClick = {
    onclick: ({ event, value, element, ...params }) => {
        event.stopPropagation()
        if (!element.classList.contains('active')) {
            element.classList.add('active')
        } else {
            element.classList.remove('active')
        }
        backRange(params)
        document.execCommand(value, false, null)
    },
}
export const eventClickNoActive = {
    onclick: ({ event, value, ...params }) => {
        event.stopPropagation()
        backRange(params)
        document.execCommand(value, false, null)
    },
}

export const eventChangeForValue = {
    onchange: ({ value, cmd, ...params }) => {
        backRange(params)
        document.execCommand(cmd, false, value)
        // hiliteColor
        // fontSize
        // heading
        // foreColor
    },
}

export const eventCustomImage = {
    onclick: ({ event, shadowRoot, range }) => {
        const source = event.target.dataset.source
        const content = shadowRoot.querySelector('.content')
        switch (source) {
            case 'cms':
                let uniqueId =
                    Date.now().toString(36) +
                    Math.random().toString(36).substring(2)
                content.dataset.id = uniqueId
                content.dataset.type = event.target.dataset.type
                MEDIA.loadFrame(event, content, event.target)
                break
            case 'upload':
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'png,jpg,svg,webp,gif,jpeg'
                input.click()
                input.onchange = (e) => {
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = (e) => {
                        const img = document.createElement('img')
                        img.src = e.target.result
                        if (range) {
                            range.insertNode(img)
                        } else {
                            content.append(img)
                        }
                        dispatchData(shadowRoot)
                    }
                }
                break
            case 'url':
                const url = prompt('Nhập link ảnh:')
                if (url.startsWith('http') || url.startsWith('data:image')) {
                    const img = document.createElement('img')
                    img.src = url
                    if (range) {
                        range.insertNode(img)
                    } else {
                        content.append(img)
                    }
                    dispatchData(shadowRoot)
                }
                break
        }
    },
}
export const eventCustomLink = {
    onclick: ({ element, shadowRoot, range, cmsEditor, ...params }) => {
        // Kiểm tra active thì lấy ra thẻ a
        let anchor = null
        let title = range ? range : ''
        let url = ''
        let target = ''
        let rel = ''
        if (element.classList.contains('active')) {
            anchor = cmsEditor.listElements.find((el) => el.localName === 'a')
            if (anchor) {
                title = anchor.innerHTML || ''
                url = anchor.getAttribute('href') || ''
                target = anchor.getAttribute('target') || ''
                rel = anchor.getAttribute('rel') || ''
                element.classList.remove('active')
            }
        }

        const content = shadowRoot.querySelector('.content')
        backRange({ shadowRoot, range, ...params })
        const form = document.createElement('form')
        form.innerHTML = addFormModal(title, url, target, rel)
        const modal = createModal(shadowRoot, form)

        form.addEventListener('submit', (e) => {
            e.preventDefault()
            const form = Object.fromEntries([...new FormData(e.target)])
            const name = form.name
            const url = form.url
            const target = form.target
            const rel = form.rel
            if (anchor) {
                anchor.innerHTML = name
                anchor.href = url
                anchor.target = target
                anchor.rel = rel
            } else {
                const link = document.createElement('a')
                link.href = url
                link.target = target
                link.rel = rel
                link.textContent = name
                if (range) {
                    range.deleteContents()
                    range.insertNode(link)
                } else {
                    content.append(link)
                }
            }
            modal.remove()
        })
    },
}

function addFormModal(title, url, target, rel) {
    return `<div class="form-group">
    <label>Tiêu đề</label>
    <textarea type="text" name="name">${title}</textarea>
</div>    
<div class="form-group">
    <label>Đường dẫn</label>
    <input type="text" name="url" placeholder="Đường dẫn..." value="${url}">
</div>
<div class="form-group">
    <label>Target</label>
    <select name="target">
        <option value="">Tab hiện tại</option>
        <option value="_blank" ${
            target === '_blank' ? 'selected' : ''
        }>Tab mới</option>
        <option value="_parent" ${
            target === '_parent' ? 'selected' : ''
        }>Tab mở tab hiện tại</option>
        <option value="_top" ${
            target === '_top' ? 'selected' : ''
        }>Tab hiện tại và thường dùng trong iframe</option>
    </select>
</div>
<div class="form-group">
    <label>Rel</label>
    <select name="rel">
        <option value="">Không</option>
        <option value="noopener" ${
            rel === 'noopener' ? 'selected' : ''
        }>noopener</option>
        <option value="noreferrer" ${
            rel === 'noreferrer' ? 'selected' : ''
        }>noreferrer</option>
        <option value="noopener noreferrer" ${
            rel === 'noopener noreferrer' ? 'selected' : ''
        }>noopener noreferrer</option>
        <option value="noopener nofollow" ${
            rel === 'noopener nofollow' ? 'selected' : ''
        }>noopener nofollow</option>
        <option value="nofollow" ${
            rel === 'nofollow' ? 'selected' : ''
        }>nofollow</option>
    </select>
</div>
<button>Lưu</button>`
}

function createModal(shadowRoot, html) {
    const modal = document.createElement('div')
    shadowRoot.append(modal)
    modal.className = 'modal'
    modal.insertAdjacentHTML(
        'beforeend',
        `<div class="modal-dialog">
            <div class="modal-header">
                <h3>Thêm liên kết</h3>
                <div class="close">&times;</div>
            </div>
            <div class="modal-body">
                
            </div>
        </div>`
    )
    const modalBody = modal.querySelector('.modal-body')
    const close = modal.querySelector('.close')
    close.addEventListener('click', () => {
        modal.remove()
    })
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove()
        }
    })
    modalBody.append(html)
    return modal
}
export const backRange = ({ shadowRoot, selectionType, range }) => {
    if (range) {
        const selection = shadowRoot.getSelection()
        if (selectionType === 'Caret') {
            selection.removeAllRanges()
        }
        selection.addRange(range)
    }
    dispatchData(shadowRoot)
}

export const dispatchData = (shadowRoot) => {
    const content = shadowRoot.querySelector('.content')
    const el = shadowRoot.host.previousElementSibling
    el.innerHTML = content.innerHTML
}
