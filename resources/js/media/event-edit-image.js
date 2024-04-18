const eventCutCanvasImage = new Event('cut-canvas-image');
import notify from '../utils/notify';
import { refreshItemEvent } from './selecting';
import { listItem } from './selector';
import template from './template';
import XHR from '../utils/xhr';
let rotate = 0;
let flip = 1;
let elementCurrent = {};
let xCurrent, yCurrent, divEl, clientX, clientY, fixedX, fixedY, fixedItem, widthBox, heightBox, topBox, leftBox;
// Vẽ hình mới thì coi như xử lý lại từ đầu thằng add EventCropImage;
function addEventEditFile(flipAction, rotateLeftAction, rotateRightAction, restoreAction, id) {
    flipAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 32v448h448V32H0zm358.4 179.2h-89.6v89.6h-89.6v89.6H89.6V121.6h268.8v89.6z"/></svg><p>Lật ảnh</p>`;
    rotateLeftAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"/></svg>
    <p>Xoay Trái</p>`;
    rotateRightAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg>
    <span>Xoay phải</span>`;
    flipAction.onclick = () => {
        flip = 1;
        rotate = 0;
        if (flip === 1) {
            flip = -1;
        } else {
            flip = 1;
        }
        eventRotateAndFlipImage();
    }

    rotateLeftAction.onclick = () => {
        flip = 1;
        rotate = 0
        rotate -= 90;
        eventRotateAndFlipImage();
    }

    rotateRightAction.onclick = () => {
        flip = 1;
        rotate = 0
        rotate += 90;
        if (rotate === 360) {
            rotate = 0;
        }
        eventRotateAndFlipImage();
    }

    if (restoreAction) {
        restoreAction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg><p>Khôi phục</p>`
        restoreAction.addEventListener('click', async function () {
            if (confirm("Bạn có muốn khôi phục lại ảnh gốc không?")) {
                try {
                    const response = await XHR.patch(`/admin/medias/edit-file/${id}`, {
                        changeImage: "original"
                    })
                    if (response.status === 200) {
                        notify.success(response.message)
                        let itemChange = Array.from(listItem.children).find(item => JSON.parse(item.dataset.file).id === response.data.id
                        );
                        itemChange.insertAdjacentHTML('beforebegin', template.itemFile(response.data))
                        itemChange.remove();
                        dispatchEvent(refreshItemEvent);
                        document.querySelector('.edit-file .edit-info button[type="button"]').click();
                    } else {
                        notify.error(response.message);
                    }
                } catch (e) {
                    notify.error(e.message);
                }
            }
        })
    }
}

function addEventCropImage(imageContainer, imgEditEl, imgEl, inputChangeImage) {
    elementCurrent = { imageContainer, imgEditEl, imgEl, inputChangeImage };
    imageContainer.style.position = "relative";
    imageContainer.style.fontSize = 0;
    imgEditEl.style.pointerEvents = 'none';
    imageContainer.style.userSelect = 'none';
    var changeImage = false;
    divEl = document.createElement('div');
    const topLeftEl = document.createElement('div');
    const topRightEl = document.createElement('div');
    const bottomLeftEl = document.createElement('div');
    const bottomRightEl = document.createElement('div');
    styleButtonCrop(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl, divEl, imgEditEl);

    divEl.append(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl);
    imageContainer.append(divEl);
    elementCurrent.divEl = divEl;
    /**
     * 
     * Thêm cropContainer vào object
     */

    elementCurrent.croppedCanvasContainer = divEl


    topLeftEl.addEventListener('mousedown', function () {
        changeImage = true;
        fixedItem = divEl.getBoundingClientRect();
        fixedX = fixedItem.left + fixedItem.width;
        fixedY = fixedItem.top + fixedItem.height;
        clientX = imageContainer.getBoundingClientRect().left;
        clientY = imageContainer.getBoundingClientRect().top;
        document.addEventListener('mousemove', moveTopLeft);
    })

    topRightEl.addEventListener('mousedown', function () {
        changeImage = true
        fixedItem = divEl.getBoundingClientRect();
        fixedY = fixedItem.top + fixedItem.height;
        clientX = imageContainer.getBoundingClientRect().left;
        clientY = imageContainer.getBoundingClientRect().top;
        document.addEventListener('mousemove', moveTopRight);
    })

    bottomLeftEl.addEventListener('mousedown', function (e) {
        changeImage = true;
        fixedItem = divEl.getBoundingClientRect();
        clientX = imageContainer.getBoundingClientRect().left;
        clientY = imageContainer.getBoundingClientRect().top;
        document.addEventListener('mousemove', moveBottomLeft);
    })

    bottomRightEl.addEventListener('mousedown', function (e) {
        changeImage = true;
        fixedItem = divEl.getBoundingClientRect();
        document.addEventListener('mousemove', moveBottomRight);
    })

    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', moveTopLeft);
        document.removeEventListener('mousemove', moveTopRight);
        document.removeEventListener('mousemove', moveBottomLeft);
        document.removeEventListener('mousemove', moveBottomRight);
        document.removeEventListener('mousemove', moveDivEl);
        if (changeImage) {
            updateImageChange();
        }
        changeImage = false;

    })
    divEl.addEventListener('mousedown', (e) => {
        if (e.target === divEl) {
            xCurrent = divEl.style.left;
            yCurrent = divEl.style.top;
            clientX = e.clientX;
            clientY = e.clientY;
            document.addEventListener('mousemove', moveDivEl);
        }
    })

    function moveDivEl(e) {
        const rect = divEl.parentElement.getBoundingClientRect();
        const rectDivCrop = divEl.getBoundingClientRect();
        const maxLeft = rect.width - rectDivCrop.width;
        const maxTop = rect.height - rectDivCrop.height;
        let x, y;
        const nextX = Math.abs(e.clientX - clientX);
        const nextY = Math.abs(e.clientY - clientY);

        x = +xCurrent.replace('px', '');
        y = +yCurrent.replace('px', '');
        x = x + (e.clientX >= clientX ? nextX : -nextX);
        y = y + (e.clientY >= clientY ? nextY : -nextY);

        if (x > maxLeft) {
            x = maxLeft;
        } else if (x < 0) {
            x = 0;
        }

        if (y > maxTop) {
            y = maxTop;
        } else if (y < 0) {
            y = 0;
        }
        divEl.style.left = x + "px";
        divEl.style.top = y + "px";
        leftBox = x;
        topBox = y

        if (divEl.style.left !== xCurrent || divEl.style.top !== yCurrent) {
            changeImage = true;
        }
    }

    function moveTopLeft(e) {
        const x = e.clientX;
        const y = e.clientY;
        leftBox = x - clientX;
        topBox = y - clientY;
        widthBox = fixedX - x;
        heightBox = fixedY - y;
        updateCropEl();
    }



    function moveTopRight(e) {
        const x = e.clientX;
        const y = e.clientY;
        topBox = y - clientY;
        leftBox = fixedItem.left - clientX;
        widthBox = x - fixedItem.left;
        heightBox = fixedY - y;
        updateCropEl();
    }

    function moveBottomLeft(e) {
        const x = e.clientX;
        const y = e.clientY;
        topBox = divEl.offsetTop;
        leftBox = x - clientX;
        widthBox = fixedItem.width + fixedItem.left - x;
        heightBox = y - fixedItem.top;
        updateCropEl();
    }

    function moveBottomRight(e) {
        const x = e.clientX;
        const y = e.clientY;
        topBox = divEl.offsetTop;
        leftBox = divEl.offsetLeft;
        widthBox = x - fixedItem.left;
        heightBox = y - fixedItem.top;
        updateCropEl();
    }

}

function updateCropEl(rotate = false) {
    if (rotate) {
        const tempBox = topBox;
        topBox = leftBox;
        leftBox = tempBox
    }
    if (heightBox >= 20 && topBox >= 0) {
        divEl.style.top = topBox + 'px';
    }
    if (widthBox >= 20 && leftBox >= 0) {
        divEl.style.left = leftBox + 'px';
    }
    const parentRectDivEl = divEl.parentElement.getBoundingClientRect();
    if (topBox + heightBox > parentRectDivEl.height) {
        heightBox = parentRectDivEl.height - topBox;
    }

    if (leftBox + widthBox > parentRectDivEl.width) {
        widthBox = parentRectDivEl.width - leftBox;
    }

    if (widthBox >= 20 && leftBox >= 0) {
        divEl.style.width = widthBox + 'px';
    }
    if (heightBox >= 20 && topBox >= 0) {
        divEl.style.height = heightBox + 'px';
    }
}

function styleButtonCrop(topLeftEl, topRightEl, bottomLeftEl, bottomRightEl, divEl, imgEditEl) {
    divEl.style.position = "absolute";
    divEl.style.top = 0;
    divEl.style.zIndex = 3;
    divEl.style.left = 0;
    divEl.style.background = 'rgba(0,0,0,0.1)';
    divEl.style.width = `${imgEditEl.offsetWidth}px`;
    divEl.style.height = `${imgEditEl.offsetHeight}px`;
    divEl.style.cursor = "move";
    widthBox = imgEditEl.offsetWidth;
    heightBox = imgEditEl.offsetHeight;
    leftBox = 0;
    topBox = 0;
    divEl.style.border = "1px solid white";

    [topLeftEl, topRightEl, bottomLeftEl, bottomRightEl].forEach(el => {
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.borderRadius = "50%";
        el.style.position = 'absolute';
        el.style.border = "1px solid white";
        el.style.background = "black";
        el.style.zIndex = 3;
    })
    topLeftEl.style.cursor = "nwse-resize";
    topRightEl.style.cursor = "sw-resize";
    bottomLeftEl.style.cursor = "sw-resize";
    bottomRightEl.style.cursor = "nwse-resize";


    topLeftEl.style.transform = `translate(-50%,-50%)`;

    topRightEl.style.transform = `translate(50%,-50%)`;
    topRightEl.style.right = 0;
    topRightEl.style.top = 0;

    bottomLeftEl.style.transform = `translate(-50%, 50%)`;
    bottomLeftEl.style.bottom = 0;
    bottomLeftEl.style.left = 0;


    bottomRightEl.style.transform = `translate(50%, 50%)`;
    bottomRightEl.style.bottom = 0;
    bottomRightEl.style.right = 0;
}

function updateImageChange() {
    if (elementCurrent.croppedCanvasContainer && elementCurrent.imgEl && elementCurrent.imgEditEl) {
        const { croppedCanvasContainer, imgEl, imgEditEl } = elementCurrent;
        eventCutCanvasImage.croppedCanvasContainer = croppedCanvasContainer;
        eventCutCanvasImage.imgEl = imgEl;
        eventCutCanvasImage.imgEditEl = imgEditEl;
        window.dispatchEvent(eventCutCanvasImage);
    }
}

function eventImage() {
    window.addEventListener('cut-canvas-image', function (e) {
        const { croppedCanvasContainer, imgEl, imgEditEl } = e;
        const { inputChangeImage } = elementCurrent;
        const widthCurrent = imgEditEl.offsetWidth;
        const heightCurrent = imgEditEl.offsetHeight;
        const widthMain = imgEditEl.naturalWidth;
        const heightMain = imgEditEl.naturalHeight;
        const rateWidth = widthMain / widthCurrent;
        const rateHeight = heightMain / heightCurrent;
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        const newImage = new Image();
        newImage.src = imgEditEl.src;
        newImage.onload = () => {
            const div = document.createElement('div');
            canvas.width = croppedCanvasContainer.offsetWidth * rateWidth;
            canvas.height = croppedCanvasContainer.offsetHeight * rateHeight;
            div.append(newImage);
            div.append(canvas);
            div.style.position = "relative";
            div.style.width = newImage.naturalWidth + 'px';
            div.style.height = newImage.naturalHeight + 'px';
            canvas.style.position = 'absolute';
            canvas.style.left = +croppedCanvasContainer.style.left.replace('px', '') * rateWidth + 'px';
            canvas.style.top = +croppedCanvasContainer.style.top.replace('px', '') * rateHeight + 'px';

            let left = +canvas.style.left.replace('px', '');
            let top = +canvas.style.top.replace('px', '');
            let x = 0;
            let y = 0;
            ctx.drawImage(newImage, left, top, canvas.width, canvas.height, x, y, canvas.width, canvas.height);
            inputChangeImage.value = 'new';
            imgEl.src = canvas.toDataURL();
        }
    })
}


function eventRotateAndFlipImage() {
    // Chỉnh sửa lại 1 chút cho đỡ rối hơn ở phần này
    const { imgEditEl, imgEl } = elementCurrent;
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext("2d");
    const newImage = new Image();
    newImage.src = imgEditEl.src;
    newImage.onload = () => {
        if (Math.abs(rotate) === 90) {
            canvas.width = newImage.naturalHeight;
            canvas.height = newImage.naturalWidth;
        } else {
            canvas.width = newImage.naturalWidth;
            canvas.height = newImage.naturalHeight;
        }
        let x = 0;
        //Rotate

        if (rotate !== 0) {
            ctx.rotate(rotate * Math.PI / 180);
            if (rotate === 90) {
                ctx.translate(0, -canvas.width);
            } else if (rotate === -90) {
                ctx.translate(-canvas.height, 0);
            }
        }

        //Flip
        if (flip === -1) {
            ctx.scale(flip, 1);
            x = +(canvas.width * flip);
        }
        ctx.drawImage(newImage, x, 0);

        imgEditEl.src = canvas.toDataURL();
        imgEditEl.onload = () => {
            imgEl.src = imgEditEl.src;
            updateCropEl(Math.abs(rotate) === 90);
            updateImageChange();
        }
    }
}



export {
    addEventCropImage, addEventEditFile
}

export default eventImage;