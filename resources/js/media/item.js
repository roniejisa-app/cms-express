import { addEventCropImage, addEventEditFile } from './event-edit-image.js';
import notify from '../utils/notify.js';
import request from '../utils/request.js';
import { refreshItemEvent } from './selecting.js';
import { folderEl, listFolderAside, listItem, listItemFolder } from './selector.js';
import template from './template.js';
import XHR from '../utils/xhr.js';
let listAnchorSide = getAnchorAsideFolder();
const eventHasNewFolder = new Event('has-new-folder');
const eventAddAllAction = new Event('add-all-action');
const eventRefreshFolder = new Event("refresh-event-folder")

function getAnchorAsideFolder() {
    return listFolderAside && listFolderAside.querySelectorAll('a');
}

function listFolder() {
    const listFolder = folderEl.querySelectorAll('.list-item .item');
    listFolder.forEach(folder => {
        folder.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            let menuFolder = document.querySelector('.menu-folder');
            if (menuFolder) {
                menuFolder.remove();
            }
            const pageX = e.pageX;
            const pageY = e.pageY;
            menuFolder = document.createElement('div');
            menuFolder.className = "menu-folder";
            const dataFolder = JSON.parse(folder.dataset.file);
            menuFolder.dataset.file = folder.dataset.file;
            menuFolder.innerHTML = template.templateFolder(dataFolder);
            document.body.append(menuFolder);
            menuFolder.style.left = pageX + "px";
            menuFolder.style.top = pageY + "px";
            const listAction = menuFolder.querySelectorAll('ul li button');
            listAction.forEach(buttonEl => {
                buttonEl.addEventListener('click', async function (e) {
                    const id = dataFolder.id;
                    switch (buttonEl.className) {
                        case 'edit':
                            const formAdd = document.createElement('form');
                            formAdd.classList.add('form-add-folder');
                            const divContainer = document.createElement('div');
                            divContainer.classList.add('form-container');
                            const input = document.createElement('input');
                            input.placeholder = "Nhập tên thư mục...";
                            input.value = dataFolder.filename;
                            const button = document.createElement('button');

                            divContainer.append(input, button);
                            formAdd.append(divContainer);
                            button.innerText = "Sửa thư mục";
                            formAdd.onsubmit = async (e) => {
                                button.setAttribute('disabled', true);
                                e.preventDefault();
                                request.setEndpoint('');
                                const res = await request.post(`/admin/medias/edit/folder/${dataFolder.id}`, {
                                    folderName: input.value,
                                });

                                if (res.data.status === 200) {
                                    notify.success(res.data.message);
                                    dataFolder.filename = res.data.folderName;
                                    folder.dataset.file = JSON.stringify(dataFolder);
                                    folder.querySelector('h3').innerText = res.data.folderName;
                                    listFolderAside.querySelector(`[data-id="${dataFolder.id}"] span`).innerText = res.data.folderName;
                                } else {
                                    notify.error(res.data.message);
                                }
                                formAdd.remove();
                            }

                            formAdd.onclick = (e) => {
                                if (e.target === formAdd) {
                                    formAdd.remove();
                                }
                            }

                            document.body.append(formAdd);
                            break;
                        case 'delete':
                            if (confirm('Chuyển mục này vào thùng rác!')) {
                                // try {
                                request.setEndpoint('');
                                const res = await request.post(`/admin/medias/delete/${dataFolder.id}`);
                                if (res.data.status === 200) {
                                    notify.success(res.data.message);
                                    folder.remove();
                                    if (menuFolder) {
                                        menuFolder.remove();
                                    }
                                    if (listItemFolder.children.length === 0) {
                                        listItemFolder.innerHTML = `<p>Chưa có thư mục nào!</p>`
                                    }
                                    const folderSidebar = Array.from(listFolderAside.children).find((folderItem) => {
                                        return +folderItem.dataset.id === +dataFolder.id;
                                    });
                                    if (folderSidebar) {
                                        folderSidebar.closest('li').remove();
                                    }
                                    if (listFolderAside.children.length === 0) {
                                        listFolderAside.innerHTML = `<ul><p>Chưa có thư mục nào!</p></ul>`
                                    }
                                } else {
                                    notify.error(res.data.message);
                                }
                                // } catch (e) {
                                //     notify.error("Thử lại sau!");
                                // }
                            }
                            break;
                        case 'restore':
                            try {
                                const res = await request.post(`/admin/medias/restore-all`, {
                                    ids: [id],
                                    restore: true
                                });
                                if (res.data.status === 200) {
                                    notify.success(res.data.message);
                                    folder.remove();
                                    if (menuFolder) {
                                        menuFolder.remove();
                                    }
                                    if (listItemFolder.children.length === 0) {
                                        listItemFolder.innerHTML = `<p>Chưa có thư mục nào!</p>`
                                    }
                                } else {
                                    notify.error(res.data.message);
                                }
                            } catch (e) {
                                notify.error("Thử lại sau!");
                            }
                            break;
                        case 'delete-force':
                            if (confirm('Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi.')) {
                                const response = await XHR.post('/admin/medias/delete-force', {
                                    ids: [dataFolder.id]
                                });
                                if (response.status === 200) {
                                    notify.success(response.message);
                                    folder.remove();
                                    if (menuFolder) {
                                        menuFolder.remove();
                                    }
                                    if (listItemFolder.children.length === 0) {
                                        listItem.innerHTML = '<p>Không có tệp tin nào!</p>'
                                    }
                                } else {
                                    notify.error(response.message);
                                }
                            }
                            break;
                    }
                })
            })
            menuFolder.addEventListener('mousedown', function (e) {
                e.stopPropagation();
            })
        })
    })
    document.addEventListener('mousedown', function (e) {
        let menuFolder = document.querySelector('.menu-folder');
        if (menuFolder) {
            menuFolder.remove();
        }
    })
}

function showFolderChild() {
    if (!listAnchorSide) return false;
    for (const anchorSide of listAnchorSide) {
        anchorSide.onclick = showFolderChild;
    }

    async function showFolderChild(e) {
        if (e.target.nodeName === 'svg' || e.target.nodeName === 'path') {
            e.preventDefault();
            if (!this.nextElementSibling) {
                const media_id = this.getAttribute('href').replace('/admin/medias/', '');
                const res = await request.get('/admin/medias/folder/' + media_id);
                this.insertAdjacentHTML('afterend', template.listItemFolderAside(res.data.folders, res.data.id));
                window.dispatchEvent(eventHasNewFolder);
            }
        }
    }
}

function allAction() {
    for (const item of listItem.children) {
        const { id, customs, filename, description, note, path_absolute, extension } = JSON.parse(item.dataset.file);
        const dataCustom = JSON.parse(customs);
        const removeItemBtn = item.querySelector('.delete');
        const editItemBtn = item.querySelector('.edit');
        const restoreItemBtn = item.querySelector('.restore');
        const deleteItemBtn = item.querySelector('.delete-force');
        item.addEventListener('mouseover', function () {
            this.classList.add('show');
        })
        item.addEventListener('mouseleave', function () {
            this.classList.remove('show');
        })

        if (removeItemBtn) {
            removeItemBtn.onclick = async () => {
                if (confirm('Chuyển mục này vào thùng rác!')) {
                    try {
                        request.setEndpoint('');
                        const res = await request.post(`/admin/medias/delete/${id}`);
                        if (res.data.status === 200) {
                            notify.success(res.data.message);
                            item.remove();
                        } else {
                            notify.error(res.data.message);
                        }

                        if (listItem.children.length === 0) {
                            listItem.innerHTML = '<p>Không có tệp tin nào!</p>'
                        }
                    } catch (e) {
                        notify.error("Thử lại sau!");
                    }
                }
            }
        }
        if (editItemBtn) {
            editItemBtn.onclick = () => {
                let editEl = document.querySelector('.edit-file');
                if (document.querySelector('.edit-file')) {
                    document.querySelector('.edit-file').remove();
                }
                editEl = document.createElement('div');
                const containerEl = document.createElement('div');
                editEl.className = 'edit-file';
                containerEl.className = "edit-container";
                editEl.append(containerEl);
                /**
                 * Kiểm tra nếu có ảnh thì mới có phần này
                 */
                var imageContainer, imgEl;
                if (['png', 'jpeg', 'webp', 'tiff', 'bmp', 'jpg'].includes(extension)) {
                    const divImageEdit = document.createElement('div');
                    const divImageContainer = document.createElement('div');
                    const divImageTool = document.createElement('div');
                    const flipAction = document.createElement('button');
                    const rotateLeftAction = document.createElement('button');
                    const rotateRightAction = document.createElement('button');
                    divImageTool.className = "toolbar";
                    divImageTool.append(rotateLeftAction, flipAction, rotateRightAction);
                    let restoreAction;
                    if (dataCustom.pathAbsoluteOriginal) {
                        restoreAction = document.createElement('button');
                        divImageTool.append(restoreAction);
                    }
                    addEventEditFile(flipAction, rotateLeftAction, rotateRightAction, restoreAction, id);
                    divImageContainer.className = 'edit-image-container';
                    imageContainer = document.createElement('div');
                    imageContainer.className = "image-container";
                    imgEl = document.createElement('img');
                    imgEl.src = `/${path_absolute}`;
                    imageContainer.append(imgEl);
                    divImageContainer.append(imageContainer);
                    divImageEdit.append(divImageContainer, divImageTool);
                    divImageEdit.className = 'edit-image';
                    containerEl.append(divImageEdit)
                }

                const divInfoEdit = document.createElement('div');
                divInfoEdit.className = "edit-info";
                containerEl.appendChild(divInfoEdit);
                document.body.append(editEl);
                document.body.style.height = '100vh'
                document.body.style.overflow = "hidden";

                /**
                 * 
                 * Thêm các file edit info
                 */
                divInfoEdit.innerHTML = template.editFile(extension, path_absolute, filename, note, description, id);
                /**
                 * Xử lý sửa file
                 */
                const formInfoEl = divInfoEdit.querySelector('form');
                const imageInfoEl = divInfoEdit.querySelector('.image img');
                const inputChangeImage = formInfoEl.querySelector('input[name="changeImage"]');
                if (imageInfoEl) {
                    imgEl.onload = () => {
                        addEventCropImage(imageContainer, imgEl, imageInfoEl, inputChangeImage)
                    };
                }
                // xử lý lưu form
                handleFormSubmit(formInfoEl, divInfoEdit);
                formInfoEl.insertAdjacentHTML('beforeend', `<div class="action">
                        <button class="btn btn-reset" type="button">Đóng</button>
                        <button class="btn btn-submit" type="submit">Lưu</button>
                    </div>`)
                const cancelEl = containerEl.querySelector('.btn-reset');
                cancelEl.addEventListener('click', function (e) {
                    document.body.style.removeProperty('height')
                    document.body.style.removeProperty('overflow')
                    editEl.remove();
                })
            }
        }
        if (restoreItemBtn) {
            restoreItemBtn.onclick = async () => {
                if (confirm('Bạn muốn khôi phục tệp tin này!')) {
                    const response = await XHR.post('/admin/medias/restore-all', {
                        ids: [id]
                    });
                    if (response.status === 200) {
                        notify.success(response.message);
                        item.remove();
                        if (listItem.children.length === 0) {
                            listItem.innerHTML = '<p>Không có tệp tin nào!</p>'
                        }
                    } else {
                        notify.error(response.message);
                    }
                }
            }
        }
        if (deleteItemBtn) {
            deleteItemBtn.onclick = async () => {
                if (confirm('Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi.')) {
                    const response = await XHR.post('/admin/medias/delete-force', {
                        ids: [id]
                    });
                    if (response.status === 200) {
                        notify.success(response.message);
                        item.remove();
                        if (listItem.children.length === 0) {
                            listItem.innerHTML = '<p>Không có tệp tin nào!</p>'
                        }
                    } else {
                        notify.error(response.message);
                    }
                }
            }
        }
    }
}

function handleFormSubmit(form, divInfoEdit) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = Object.fromEntries([...new FormData(e.target)]);
        if (formData.changeImage === "new") {
            const imageInfoEl = divInfoEdit.querySelector('.image img');
            formData.base64Image = imageInfoEl.src;
        }
        const media_id = window.location.pathname.replace('/admin/medias', '');
        formData.media_id = media_id;
        try {
            const response = await XHR.patch(form.getAttribute('action'), formData);
            if (response.status === 200) {
                notify.success(response.message)
                let itemChange = Array.from(listItem.children).find(item => JSON.parse(item.dataset.file).id === response.data.id
                );
                itemChange.insertAdjacentHTML('beforebegin', template.itemFile(response.data))
                itemChange.remove();
                dispatchEvent(refreshItemEvent);
                form.querySelector('button[type="button"]').click();
            } else {
                notify.error(response.message);
            }
        } catch (e) {
            notify.error(e.message);
        }
    })
}

function item() {
    showFolderChild();
    allAction();
    listFolder();
    window.addEventListener('add-all-action', allAction);
    window.addEventListener('has-new-folder', () => {
        listAnchorSide = getAnchorAsideFolder();
        showFolderChild();
    })
    window.addEventListener('refresh-event-folder', listFolder);
}
export {
    eventHasNewFolder, eventAddAllAction, allAction, eventRefreshFolder
}
export default item;

