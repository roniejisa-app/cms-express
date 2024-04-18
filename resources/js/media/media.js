import selecting, { eventChooseImage, getItemSelecting } from "./selecting.js";
import upload from "./upload.js";
import screen from "./screen.js";
import item from "./item.js";
import eventImage from "./event-edit-image.js";
import XHR from "../utils/xhr.js";
import notify from "../utils/notify.js";

var MAIN = (() => {
    function handleDeleteAll() {
        const deleteAllBtn = document.querySelector('.events .delete');
        deleteAllBtn && deleteAllBtn.addEventListener('click', async (e) => {
            if (confirm('Bạn có muốn xóa các tệp tin đã chọn?')) {
                let listItemSelecting = getItemSelecting()
                let ids = listItemSelecting.map(item => JSON.parse(item.dataset.file).id);
                deleteAllBtn.setAttribute('disabled', true);
                const response = await XHR.post('/admin/medias/delete-all', {
                    ids
                });
                if (response.status === 200) {
                    notify.success(response.message);
                    listItemSelecting.forEach(item => item.remove());
                } else {
                    notify.error(response.message);
                }
                deleteAllBtn.removeAttribute('disabled');
            }
        })

        deleteAllBtn && deleteAllBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        })
    }

    function handleRestoreAll() {
        const restoreAllBtn = document.querySelector('.events .restore');
        restoreAllBtn && restoreAllBtn.addEventListener('click', async (e) => {
            if (confirm('Bạn có muốn khôi phục các tệp tin đã chọn?')) {
                let listItemSelecting = getItemSelecting()
                let ids = listItemSelecting.map(item => JSON.parse(item.dataset.file).id);
                restoreAllBtn.setAttribute('disabled', true);
                const response = await XHR.post('/admin/medias/restore-all', {
                    ids
                });
                if (response.status === 200) {
                    notify.success(response.message);
                    listItemSelecting.forEach(item => item.remove());
                } else {
                    notify.error(response.message);
                }
                restoreAllBtn.removeAttribute('disabled');
            }
        })

        restoreAllBtn && restoreAllBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        })
    }

    function handleDeleteForce() {
        const deleteForceAll = document.querySelector('.events .delete-force');
        deleteForceAll && deleteForceAll.addEventListener('click', async (e) => {
            if (confirm('Bạn có chắc muốn xóa tệp tin này? Chúng sẽ không còn xuất hiện trên blog của bạn, bao gồm bài viết, trang, và widget. Hành động này không thể phục hồi?')) {
                let listItemSelecting = getItemSelecting()
                let ids = listItemSelecting.map(item => JSON.parse(item.dataset.file).id);
                deleteForceAll.setAttribute('disabled', true);
                const response = await XHR.post('/admin/medias/delete-force', {
                    ids
                });
                if (response.status === 200) {
                    notify.success(response.message);
                    listItemSelecting.forEach(item => item.remove());
                } else {
                    notify.error(response.message);
                }
                deleteForceAll.removeAttribute('disabled');
            }
        })

        deleteForceAll && deleteForceAll.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        })
    }

    function chooseFile() {
        const chooseFile = document.querySelector('.events .choose-file');
        if (!chooseFile) return;
        chooseFile.addEventListener('click', function (e) {
            const iframeEl = window.frameElement;
            const uuid = iframeEl.dataset.uuid;
            const type = iframeEl.dataset.type;
            const objectData = getItemSelecting(type);
            if (!objectData.item) {
                return notify.error("Vui lòng chọn tệp tin");
            }
            eventChooseImage.uuid = uuid;
            eventChooseImage.data = objectData.item.dataset.file;
            eventChooseImage.typeImage = type;
            window.parent.dispatchEvent(eventChooseImage);
        });

        chooseFile.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        })
    }



    return {
        init: () => {
            handleDeleteAll();
            handleRestoreAll();
            handleDeleteForce();
            chooseFile();
        }
    }
})()

window.addEventListener('DOMContentLoaded', function () {
    MAIN.init();
    selecting();
    upload();
    screen();
    item();
    eventImage();
})