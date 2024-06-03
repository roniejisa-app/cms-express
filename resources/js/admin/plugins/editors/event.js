import MEDIA from '../../media'
export const eventClick = {
    onclick: (e, value, element, ...params) => {
        e.stopPropagation()
        if (element.classList.contains('active')) {
            element.classList.remove('active')
        } else {
            element.classList.add('active')
        }
        backRange(...params)
        document.execCommand(value, false, null)
    },
}
export const eventClickNoActive = {
    onclick: (e, value, element, ...params) => {
        e.stopPropagation()
        backRange(...params)
        document.execCommand(value, false, null)
    },
}

export const eventChangeFontSize = {
    onchange: (e, value, element, ...params) => {
        backRange(...params)
        document.execCommand('fontSize', false, e.target.value)
    },
}

export const eventChangeHiliteColor = {
    onchange: (e, value, element, ...params) => {
        console.log(value)
        backRange(...params)
        document.execCommand('hiliteColor', false, e.target.value)
    },
}

export const eventChangeHeading = {
    onchange: (e, value, element, ...params) => {
        backRange(...params)
        document.execCommand('heading', false, value)
    },
}

export const eventChangeFontStyle = {
    onchange: (e, value, element, ...params) => {
        backRange(...params)
        document.execCommand('foreColor', false, e.target.value)
    },
}

export const eventCustomImage = {
    onclick: (e, element, shadow, range) => {
        const source = e.target.dataset.source
        const content = shadow.querySelector('.content')
        switch (source) {
            case 'cms':
                let uniqueId =
                    Date.now().toString(36) +
                    Math.random().toString(36).substring(2)
                content.dataset.id = uniqueId
                content.dataset.type = e.target.dataset.type
                MEDIA.loadFrame(e, content, e.target)
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
                        dispatchData(shadow)
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
                    dispatchData(shadow)
                }
                break
        }
    },
}
export const eventCustomLink = {
    onclick: (e, element, shadow, range, data) => {
        // Kiểm tra active thì lấy ra thẻ a
        let anchor = null
        let title = range ? range : ''
        let url = ''
        let target = ''
        let rel = ''
        if (element.classList.contains('active')) {
            anchor = data.listElements.find((el) => el.localName === 'a')
            if (anchor) {
                title = anchor.innerHTML || ''
                url = anchor.getAttribute('href') || ''
                target = anchor.getAttribute('target') || ''
                rel = anchor.getAttribute('rel') || ''
                element.classList.remove('active')
            }
        }

        const content = shadow.querySelector('.content')
        backRange(shadow, range)
        const form = document.createElement('form')
        form.innerHTML = `<div class="form-group">
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
        const modal = createModal(shadow, form)

        form.addEventListener('submit', (e) => {
            e.preventDefault()
            const form = Object.fromEntries([...new FormData(e.target)]);
            const name = form.name
            const url = form.url
            const target = form.target
            const rel = form.rel
            console.log(form);
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

function createModal(shadow, html) {
    const modal = document.createElement('div')
    shadow.append(modal)
    modal.className = 'modal'
    modal.insertAdjacentHTML(
        'beforeend',
        `<div class="modal-dialog">
            <div class="modal-header">
                <h3>Thêm liên kết</h3>
                <div class="close" onclick="this.parentElement.parentElement.remove()">&times;</div>
            </div>
            <div class="modal-body">
                
            </div>
        </div>`
    )
    const modalBody = modal.querySelector('.modal-body')
    modalBody.append(html)
    return modal
}
export const backRange = (shadow, range) => {
    if (range) {
        const selection = shadow.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
    }
    dispatchData(shadow)
}

export const dispatchData = (shadow) => {
    const content = shadow.querySelector('.content')
    const nameInsertValue = content.dataset.name
    const el = document.querySelector(`[name="${nameInsertValue}"]`)
    el.innerHTML = content.innerHTML
}
