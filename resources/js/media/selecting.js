import { files, listItem, mediaInfo } from './selector.js';
import { allAction } from './item.js';
import {formatBytes} from '../utils/utils.js';
var items = listItem.querySelectorAll('.item');
var showInfo = new Event('show-info-file');
//Xử lý các vấn đề sau 
/**
 * 1 Bôi đen select
 * click thì chọn 1 cái
 * 
 * nhấn thì là di chuyển kéo thả
 * 
 * 
 * 
 */


var canvas, ctx, pageX, pageY, movePageX, movePageY, positionTransform, divCloneCanvas, itemsSelecting;
var selecting = false

function handleMouseDown(event) {
    event.preventDefault();
    if (!event.target.closest('.item')) {
        selecting = true;
        itemsSelecting = getItemSelecting();
        canvas = document.createElement('canvas');
        document.body.append(canvas);
        ctx = canvas.getContext('2d');
        const rect = files.getBoundingClientRect();;
        pageX = event.pageX - rect.left - window.pageXOffset;
        pageY = event.pageY - rect.top - window.pageYOffset;
        files.style.position = "relative";
        canvas.style.position = "absolute";
        canvas.style.zIndex = '9999';
        canvas.width = files.clientWidth;
        canvas.height = files.clientHeight;
        canvas.style.left = 0;
        canvas.style.top = 0;
        files.append(canvas);

        // Thêm divClone hình của canvas 
        divCloneCanvas = document.createElement('div');
        divCloneCanvas.style.position = "absolute"
        divCloneCanvas.style.zIndex = "1000";
        files.append(divCloneCanvas);
    }
}

function handleMouseMove(event) {
    if (selecting) {
        var x, y;
        if (event.target === canvas) {
            x = event.offsetX - pageX;
            y = event.offsetY - pageY;


            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Vẽ hình chữ nhật
            ctx.beginPath();
            ctx.rect(pageX, pageY, x, y);
            ctx.fillStyle = "#80afe799";
            ctx.fill();
            movePageX = event.offsetX
            movePageY = event.offsetY
            // Xóa canvas trước khi vẽ lại
            if (event.offsetX >= pageX && event.offsetY >= pageY) {
                positionTransform = {
                    x: pageX,
                    y: pageY
                }
            } else if (event.offsetX >= pageX && event.offsetY <= pageY) {
                positionTransform = {
                    x: pageX,
                    y: movePageY
                }
            } else if (event.offsetX <= pageX && event.offsetX && event.offsetY >= pageY) {
                positionTransform = {
                    x: movePageX,
                    y: pageY
                }
            } else {
                positionTransform = {
                    x: movePageX,
                    y: movePageY
                }
            }
            // Xử lý selecting 
            divCloneCanvas.style.width = Math.abs(x) + "px";
            divCloneCanvas.style.height = Math.abs(y) + "px";
            divCloneCanvas.style.top = positionTransform.y + "px";
            divCloneCanvas.style.left = positionTransform.x + "px";
            Array.from(items).forEach(item => {
                if (isCollision(item, divCloneCanvas) && event.ctrlKey && itemsSelecting.includes(item)) {
                    item.firstElementChild.checked = false;
                } else if (isCollision(item, divCloneCanvas) || (event.ctrlKey && itemsSelecting.includes(item)) || (event.shiftKey && itemsSelecting.includes(item))) {
                    if (!item.firstElementChild.checked) item.firstElementChild.checked = true;
                } else {
                    item.firstElementChild.checked = false
                }
            });
        }
    }
}


function handleMouseUp() {
    divCloneCanvas && divCloneCanvas.remove();
    positionTransform = undefined;
    selecting = false;
    canvas && canvas.remove();
    window.dispatchEvent(showInfo)
}

function isCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    if (
        rect1.left < rect2.left + rect2.width &&
        rect1.left + rect1.width > rect2.left &&
        rect1.top < rect2.top + rect2.height &&
        rect1.top + rect1.height > rect2.top
    ) {
        // Có va chạm
        return true;
    }

    // Không va chạm
    return false;
}

function addEventForItems() {
    /*
        Trường hợp item đã chọn không phải item target
        1. Có nút ctrl thì thêm item

        2. Có giữ shift 
        -   Chọn từ file cuối cùng được chọn đến file cuối cùng
    */

    /**
     * Mặc định nếu không có item đã chọn thì chọn item đầu tiên
     * 
     */
    for (var index = 0; index < items.length; index++) {
        items[index].index = index;
        items[index].onclick = function (event) {
            event.preventDefault();
            const _this = this;
            var startItemChecked = getItemSelecting('start');
            var lastItemChecked = getItemSelecting('last');
            var listItemSelecting = getItemSelecting();
            if (!event.ctrlKey && !event.shiftKey) {
                if (listItemSelecting.length) {
                    listItemSelecting.forEach(item => {
                        if (item !== this) {
                            item.firstElementChild.checked = false
                        }
                    });
                }
                this.firstElementChild.checked = true;
            } else if (event.ctrlKey) {
                if (this.firstElementChild.checked) {
                    this.firstElementChild.checked = false;
                } else {
                    this.firstElementChild.checked = true;
                }
            } else if (event.shiftKey) {
                if (listItemSelecting.length) {
                    /**
                     * Kiểm tra đứt đoạn giữa start và last
                     */

                    var isIndexNotSeamless = null;
                    for (var i = startItemChecked.index; i <= lastItemChecked.index; i++) {
                        if (!listItemSelecting[i]) {
                            isIndexNotSeamless = i - 1;
                            break;
                        }
                    }
                    if (_this.index >= lastItemChecked.index && !isIndexNotSeamless) {
                        /**
                         * target lớn hơn và không có đoạn đứt
                         */
                        let indexStart = lastItemChecked.index + 1;
                        while (indexStart <= _this.index) {
                            items[indexStart].firstElementChild.checked = true;
                            indexStart++;
                        }
                    } else if (_this.index >= lastItemChecked.index && isIndexNotSeamless) {
                        /**
                         * target lớn hơn và có đoạn đứt thì lấy tất cả các item từ đoạn đứt kể ca chưa check cũng cho thành check
                         */
                        var indexStart = isIndexNotSeamless + 1;
                        while (indexStart <= _this.index) {
                            items[indexStart].firstElementChild.checked = true;
                            indexStart++;
                        }
                    } else if (_this.index <= lastItemChecked.index && _this.index >= startItemChecked.index && !isIndexNotSeamless) {
                        for (var i = startItemChecked.index; i <= lastItemChecked.index; i++) {
                            listItemSelecting[i].firstElementChild.checked = i <= _this.index;
                        }
                    } else if (_this.index <= lastItemChecked.index && _this.index >= startItemChecked.index && isIndexNotSeamless) {
                        for (var i = startItemChecked.index; i <= lastItemChecked.index; i++) {
                            if (listItemSelecting[i]) {
                                listItemSelecting[i].firstElementChild.checked = i <= _this.index;
                            }
                        }
                    } else if (_this.index < startItemChecked.index) {
                        var indexStart = _this.index;
                        while (indexStart <= startItemChecked.index) {
                            items[indexStart].firstElementChild.checked = true;
                            indexStart++;
                        }
                    }
                } else {
                    Array.from(items).filter((item, index) => index <= _this.index).forEach(item => item.firstElementChild.checked = true);
                }
                /**
                 * Phải kiểm tra phần tử được chọn là trước hay sau phần tử 
                 */
            }
            window.dispatchEvent(showInfo)
        }
    }
}

// Refresh Item
function getItemSelecting(position = undefined) {
    const listItemSelecting = [];
    let firstIndex = null;
    let lastIndex = null;
    for (var index = 0; index < items.length; index++) {
        if (items[index].firstElementChild.checked) {
            if (firstIndex === null) {
                firstIndex = index;
            }
            lastIndex = index;
            listItemSelecting[index] = items[index];
        }
    }

    switch (position) {
        case 'start':
            var objectItem = {
                index: firstIndex,
                item: listItemSelecting[firstIndex]
            };
            return objectItem;
        case 'last':
            var objectItem = {
                index: lastIndex,
                item: listItemSelecting[lastIndex]
            };
            return objectItem;
        default:
            return listItemSelecting;
    }
}

function refreshItem() {
    if (canvas) {
        canvas.width = files.clientWidth;
        canvas.height = files.clientHeight;
    }
    items = listItem.querySelectorAll('.item');
    addEventForItems();
    allAction();
}

function startSelecting() {
    files.addEventListener('mousedown', handleMouseDown);
    /**
     * Có vị trí lấy ban đầu , vị chí lấy ở cuối
     * 
     * Nếu theo right top thì offsetLeft là movePageX, offsetTop là pageY
     * 
     * 
     * 
     */
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    /**
     * 
     * Sự kiên khi chạm 
     */
    /*
        Cần thêm sự kiện khi ấn thì cũng phải bỏ canvas đi tránh lỗi 
    */
    /** Sự kiện cho touch */
    files.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    document.addEventListener('mousedown', function (event) {
        if (!event.target.closest('.item') && !event.ctrlKey && !event.shiftKey) {
            getItemSelecting().forEach(item => item.firstElementChild.checked = false)
        }
    });

    window.addEventListener('refresh-event', refreshItem)
    window.addEventListener('show-info-file', function () {
        let objectItem = getItemSelecting('last');
        if (!objectItem.index) {
            mediaInfo.innerHTML = '<p class="text-center">Chọn tệp để xem thông tin</p>';
            return false;
        };
        let dataFile = JSON.parse(objectItem.item.dataset.file);
        let custom = dataFile.customs ? JSON.parse(dataFile.customs) : [];

        if (Object.keys(custom).length === 0) {
            mediaInfo.innerHTML = '<p class="text-center">Chọn tệp để xem thông tin</p>';
            return false;
        }
        // Định nghĩa lại object data vì khi parse sẽ bị sort
        var objectDataInfo = {};
        const imgEl = document.createElement('img');
        const tableEl = document.createElement('table');
        const tbodyEl = document.createElement('tbody');
        let trTable = document.createElement('tr');

        mediaInfo.innerHTML = '';
        mediaInfo.innerHTML = `<h1>Thông tin</h1>
                            <div class="image"></div>
                            <div class="info-body"></div>`;
        const imageEl = mediaInfo.querySelector('.image');
        const infoBody = mediaInfo.querySelector('.info-body');
        tableEl.append(tbodyEl);
        infoBody.append(tableEl);
        tbodyEl.append(trTable);
        let hasNature = false
        if (custom.extension && custom.pathAbsolute) {
            if (['png', 'gif', 'jpg', 'webp', 'jpeg', 'svg'].includes(custom.extension)) {
                imgEl.src = `/${custom.pathAbsolute}`;
                hasNature = true;
            } else if (["docx", "mp4", "pdf", 'xlsx', 'pptx'].includes(custom.extension)) {
                imgEl.src = `/images/admin/${custom.extension}.svg`;
            } else {
                imgEl.src = `/images/admin/file.svg`;
            }
            imgEl.src && imageEl.append(imgEl)
        }

        if (imgEl.src) {
            imgEl.onload = (e) => showInfo(e, hasNature)
        } else {
            showInfo(false);
        }

        function showInfo(e, isImage = false) {
            objectDataInfo.filename = custom.filename;
            objectDataInfo.extension = custom.extension;
            objectDataInfo.size = formatBytes(custom.size);
            if (isImage) {
                objectDataInfo.natural = `${imgEl.naturalWidth} ✕ ${imgEl.naturalHeight}`
            }
            objectDataInfo.created_at = custom.created_at;
            let count = 0;
            for (const [key, value] of Object.entries(objectDataInfo)) {
                if (value) {
                    if (trTable.children.length >= 2) {
                        let newTrTable = document.createElement('tr');
                        tbodyEl.append(newTrTable);
                        trTable = newTrTable;
                    }
                    switch (key) {
                        case 'filename':
                            trTable.insertAdjacentHTML('beforeend', `<td>
                            <div class="title">Tên tệp tin</div>
                            <div class="info">${value}</div>
                        </td>`)
                            break;
                        case 'extension':
                            trTable.insertAdjacentHTML('beforeend', `<td>
                            <div class="title">Định dạng</div>
                            <div class="info">${value}</div>
                        </td>`);
                            break;
                        case 'size':
                            trTable.insertAdjacentHTML('beforeend', `<td>
                            <div class="title">Dung lượng</div>
                            <div class="info">${value}</div>
                        </td>`);
                            break;
                        case 'natural':
                            trTable.insertAdjacentHTML('beforeend', `<td>
                            <div class="title">Kích thước</div>
                            <div class="info">${value}</div>
                        </td>`);
                            break;
                        case 'created_at':
                            const time = new Date(value);
                            const day = time.getDate();
                            const month = time.getMonth();
                            const year = time.getFullYear();
                            trTable.insertAdjacentHTML('beforeend', `<td>
                            <div class="title">Ngày tải lên</div>
                            <div class="info">${day} tháng ${month} ${year}</div>
                        </td>`);
                            break;
                    }
                }
            }
        }
    })
    addEventForItems();
}


export default startSelecting;
export const refreshItemEvent = new Event('refresh-event');
export const eventChooseImage = new Event('choose-image');
export {
    getItemSelecting
}

export { items }