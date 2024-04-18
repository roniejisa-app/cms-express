import request from "../utils/request.js";
import notify from "../utils/notify.js";
import XHR from '../utils/xhr.js';
import { refreshItemEvent } from './selecting.js';
import { listItemFolder, listItem, listFolderAside } from './selector.js';
import { eventHasNewFolder, eventRefreshFolder } from "./item.js";
import template from './template.js';
const buttonAddNewFolder = document.querySelector('.add-folder');
const buttonUploadFile = document.querySelector('.upload-file');
let dataTransfer = new DataTransfer();
const eventAddFolder = new Event('add-folder');
const eventUploadFile = new Event('add-file');
const eventLoadItem = new Event('load-item');
var formAdd, formUploadFile;
window.addEventListener('add-folder', (e) => {
    formAdd = document.createElement('form');
    formAdd.classList.add('form-add-folder');
    const divContainer = document.createElement('div');
    divContainer.classList.add('form-container');
    const input = document.createElement('input');
    input.placeholder = "Nhập tên thư mục...";
    const button = document.createElement('button');

    divContainer.append(input, button);
    formAdd.append(divContainer);
    const media_id = window.location.pathname.replace('/admin/medias', '');

    button.innerText = "Thêm thư mục";
    formAdd.onsubmit = async (e) => {
        button.setAttribute('disabled', true);
        e.preventDefault();
        request.setEndpoint('http://localhost:3000/admin')
        const res = await request.post('/medias/add/folder', {
            folderName: input.value,
            media_id
        });

        if (res.data.status === 'NOT OK') {
            notify.error(res.data.errors[0].folderName);
        } else {

            if (!listItemFolder.querySelector('a')) {
                listItemFolder.innerHTML = '';
            }

            if (!listFolderAside.querySelector('li')) {
                listFolderAside.innerHTML = '';
            }
            // Để thêm folder mới vào sidebar
            /**
             * Kiểm tra nếu media_id khác null
             */
            let anchor = listFolderAside.querySelector(`[href="/admin/medias/${media_id.startsWith('/') ? media_id.slice(1) : media_id}"]`);
            if (!anchor) {
                listFolderAside.insertAdjacentHTML('beforeend', template.itemFolderAside(res.data.folder));
            } else if (!anchor.nextElementSibling) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttributeNS(null, 'viewBox', '0 0 320 512')
                svg.innerHTML = `<path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>`;
                anchor.prepend(svg);
                anchor.insertAdjacentHTML('afterend', `<ul>${template.itemFolderAside(res.data.folder)}</ul>`)
            } else {
                anchor.nextElementSibling.insertAdjacentHTML('beforeend', template.itemFolderAside(res.data.folder))
            }
            window.dispatchEvent(eventHasNewFolder);
            // Xử lý xong
            listItemFolder.insertAdjacentHTML('beforeend', template.itemFolder(res.data.folder));
            notify.success(res.data.message);
            formAdd.remove();
            window.dispatchEvent(eventRefreshFolder);
        }
    }

    formAdd.onclick = (e) => {
        if (e.target === formAdd) {
            formAdd.remove();
        }
    }

    document.body.append(formAdd);
    //Khóa body lại
});

window.addEventListener('add-file', e => {
    formUploadFile = document.createElement('form');
    formUploadFile.classList.add('form-add-file');
    formUploadFile.onclick = (e) => {
        if (e.target === formUploadFile) {
            formUploadFile.remove();
            dataTransfer = new DataTransfer();
        }
    }
    const { divContainer, input, button } = handleUploadPlace();
    // Sau cùng
    formUploadFile.append(divContainer);
    formUploadFile.onsubmit = async (e) => {
        e.preventDefault();
        button.setAttribute('disabled', true);
        XHR.setEndpoint('http://localhost:3000/admin');

        const media_id = window.location.pathname.replace('/admin/medias', '');
        XHR.setType('formData');
        // Xử lý process

        const res = await XHR.post('/medias/add/file', {
            files: Array.from(input.files),
            media_id
        });

        if (res.status === 200) {
            if (!listItem.querySelector('.item')) {
                listItem.innerHTML = '';
            }
            eventLoadItem.items = res.successFiles;
            window.dispatchEvent(eventLoadItem);
            notify.success(res.message);
            formUploadFile.remove();
            dataTransfer = new DataTransfer();
            window.dispatchEvent(refreshItemEvent);
        } else {
            notify.error(res.message);
            button.removeAttribute('disabled');
        }
    };
    document.body.append(formUploadFile);
})

function handleUploadPlace() {
    let itemDrag = null;
    let uploadPlace = document.createElement('div');
    const divContainer = document.createElement('div');
    const input = document.createElement('input');
    const button = document.createElement('button');
    const listFileEl = document.createElement('div');
    const spanCount = document.createElement('span');
    const countChoose = document.createTextNode(0);
    const quoteTextNode = document.createTextNode("");
    spanCount.style.color = "white";
    spanCount.innerText = 'Đã chọn (';
    quoteTextNode.data = ")";
    spanCount.append(countChoose, quoteTextNode);

    listFileEl.className = 'items';

    uploadPlace.className = "upload-place";
    divContainer.classList.add('form-container');

    // Input
    input.type = "file"
    input.setAttribute('hidden', '');
    input.setAttribute('multiple', '');
    // Button
    button.innerText = "Thêm file";
    button.className = "btn-submit";

    // Sau cùng
    uploadPlace.append(listFileEl);
    divContainer.append(spanCount, button, uploadPlace, input);
    addActionForInput();

    uploadPlace.ondragover = (e) => {
        e.preventDefault();
    }

    function addActionForInput() {
        uploadPlace.onclick = (e) => {
            if (e.target === uploadPlace || e.target === listFileEl) input.click();
        }

        input.onchange = (e) => {
            const files = e.target.files;
            let dataTransferFiles = dataTransfer.files;
            const dataTransferItems = dataTransfer.items;
            if (dataTransferFiles.length === 0) {
                for (let i = 0; i < files.length; i++) {
                    dataTransferItems.add(files[i]);
                }
                renderItems(getDataTransferFiles());
            } else {
                const newFiles = Array.from(files).filter(file => {
                    if (!Array.from(dataTransferFiles).some(dataTransferFile => isSame(dataTransferFile, file))) {
                        dataTransferItems.add(file);
                        return true;
                    } else {
                        return false;
                    }
                })
                /**
                 * Thêm các file mới vào files cũ và cập nhật
                 */
                if (newFiles.length) {
                    renderItems(newFiles);
                    // Chỗ này là cập nhật mới sau khi add thêm
                }
            }
            getDataTransferFiles();
        }
    }

    function getDataTransferFiles() {
        input.files = dataTransfer.files;
        countChoose.data = dataTransfer.files.length;
        return dataTransfer.files;
    }

    function renderItems(items) {
        const listEl = Array.from(items).map((file, index) => {
            const filename = file.name;
            const extension = filename.slice(filename.lastIndexOf('.') + 1);
            const url = URL.createObjectURL(file);
            const itemEl = document.createElement('div');
            const span = document.createElement('span');
            const img = document.createElement('img');
            const button = document.createElement('button');
            span.innerText = filename;
            itemEl.className = 'item';
            if (['png', 'jpeg', 'jpg', 'webp', 'tiff', 'svg', 'bmp'].includes(extension.toLowerCase())) {
                img.src = url;
            } else if (['docx', 'pptx', 'xlsx', 'pdf', 'mp4'].includes(extension.toLowerCase())) {
                img.src = `/images/admin/${extension.toLowerCase()}.svg`;
            } else {
                img.src = "/images/admin/file.svg";
            }

            button.type = 'button';
            button.innerHTML = '&times;';

            itemEl.setAttribute('data-info', JSON.stringify({
                name: file.name,
                type: file.type,
                size: file.size
            }))

            itemEl.append(img, button, span);
            return {
                itemEl,
                url,
                button,
                name: file.name,
                type: file.type,
                size: file.size,
            };
        })
        listFileEl.append(...listEl.map(el => el.itemEl));
        // Thêm sự kiện kéo trên
        listFileEl.ondragover = (e) => {
            e.preventDefault();
        }

        listEl.forEach((item) => {
            item.button.onclick = (e) => {
                e.preventDefault();
                const indexRemove = Array.from(dataTransfer.files).findIndex(dataTransferFile => isSame(dataTransferFile, item));
                dataTransfer.items.remove(indexRemove);
                item.itemEl.remove();
                getDataTransferFiles();
            }
            // Kích hoạt kiện kéo
            item.itemEl.draggable = true;

            item.itemEl.ondragstart = (e) => {
                itemDrag = item.itemEl;
            }

            item.itemEl.ondragover = (e) => {
                e.preventDefault();
                const itemTarget = e.target.closest('.item');
                if (itemTarget) {
                    const rate = itemTarget.offsetWidth / 2;
                    if (e.offsetX > rate) {
                        itemTarget.parentElement.insertBefore(itemTarget, itemDrag);
                    } else if (e.offsetX <= rate) {
                        itemTarget.parentElement.insertBefore(itemDrag, itemTarget);
                    }
                }
            }

            item.itemEl.ondrop = () => {
                itemDrag = null;
                sortAfterDrag();
            }
        })
    }

    function isSame(fileOne, fileTwo) {
        return fileOne.name === fileTwo.name && fileOne.size === fileTwo.size && fileOne.type === fileTwo.type
    }

    function sortAfterDrag() {
        const newDataTransfer = new DataTransfer();
        const listChildren = listFileEl.children
        for (let i = 0; i < listChildren.length; i++) {
            const index = Array.from(dataTransfer.files).findIndex(dataTransferFile => isSame(dataTransferFile, JSON.parse(listChildren[i].dataset.info)));
            if (index !== -1) {
                newDataTransfer.items.add(dataTransfer.files[index]);
            }
        }
        dataTransfer = newDataTransfer;
        getDataTransferFiles();
    }
    return {
        divContainer, input, button
    };
}

window.addEventListener('load-item', e => {
    if (e.items && Array.isArray(e.items)) {
        e.items.forEach(item => {
            listItem.insertAdjacentHTML('afterbegin', template.itemFile(item))
        })
    }
})
function upload() {
    if(buttonAddNewFolder){
        buttonAddNewFolder.onclick = (e) => {
            window.dispatchEvent(eventAddFolder);
        }
    }

    if(buttonUploadFile){
        buttonUploadFile.onclick = (e) => {
            window.dispatchEvent(eventUploadFile);
        }
    }
}
export {
    eventAddFolder,
    eventUploadFile,
    eventLoadItem
}

export default upload;