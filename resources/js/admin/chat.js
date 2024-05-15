import socket from './socket.js';
import { eD, dD, getBase64 } from '../utils/utils.js';
import listStickers from '../sticker/list.js';
import emojiUtil from '../sticker/showImage.js';
import emojiData from '@emoji-mart/data/sets/14/facebook.json'
import { Picker } from 'emoji-mart'
import langEmoji from './emoji-lang-vi.js';
import { convertStringToEmoji } from '../utils/emoji-convert.js';
import { createScrollbar, resizeEditorChat, beforeResizeEditorChat } from '../utils/scroll-bar.js';
import { rsLoading } from '../utils/template.js';
import { stringVietnamese } from '../utils/pattern.js';
const submitEventChat = new Event('submit-form-chat');
const eventUpdateAction = new Event("update-action-message-item");
const CHAT = (() => {
    const inputFile = document.createElement('input');

    // Thêm input file;
    const chatBox = document.querySelector('.chat-box-admin')
    const buttonShowChatBox = chatBox.querySelector('.show-chat-box')
    const chatHTML = chatBox.querySelector('.chat-content')
    const messageEl = chatHTML.querySelector('.message');
    const formChat = chatHTML.querySelector('.form-chat');
    const buttonFeel = formChat.querySelector('[data-type="icon"]');
    const editorChatContent = chatHTML.querySelector('.editor-chat-container');
    const editorChat = chatHTML.querySelector('.editor-chat');
    const actions = chatHTML.querySelector('.actions')
    const chatContentHeader = chatHTML.querySelector('.chat-content-header')
    const chatClose = chatContentHeader.querySelector('.chat-close')
    const actionPlus = chatHTML.querySelector('.action-plus');
    const actionMenuSub = actionPlus.querySelector('.action-sub-menu');
    const listActionSub = actionMenuSub.querySelectorAll('ul button');
    let boxImageUpload;
    let buttonAddFileEl;
    let listFileAddEl;
    let stickerBox = null;
    let tabBox = null;
    let stickerItemList = null;
    const userId = chatBox.dataset.userId;
    let observer;
    let itemDrag;
    let indexEmojiCurrent = 0;
    let page = 2;
    let pageLoadMore = false;
    let newDataTransfer = new DataTransfer();
    let editorHeight = 0;
    let flagWidth = false,
        rectAction,
        actionsWidth,
        addSocketEventNow = false;

    function addSocketEvent() {
        if (addSocketEventNow) return;
        addSocketEventNow = true;
        socket.on('connect', () => {
            chatHTML.classList.add('show')
            addEventSocketConnect();
            window.addEventListener('update-action-message-item', addEventForItemMessage);
            window.addEventListener("paste", handlePasteData);
            socket.emit(
                'connect-admin-socket',
                'admin',
                userId,
            )
        })


        socket.on('connect_error', () => {
            chatHTML.classList.remove('show')
            socket.disconnect();
        })

        socket.on('disconnect', () => {
            chatHTML.classList.remove('show');
            window.removeEventListener("paste", handlePasteData);
            formChat.removeEventListener('submit-form-chat', handleChat)
            editorChat.removeEventListener('keyup', handleKeyup)
            editorChat.removeEventListener('keydown', handleKeydown)
            chatClose.removeEventListener('keyup', handleDisconnect)
            document.removeEventListener('mouseup', handleDocumentAddSocket)
            actionMenuSub.removeEventListener(
                'mousedown',
                handleActionMenuMousedown
            )
            actionPlus.removeEventListener(
                'mousedown',
                handleActionPlusMouseDown
            );
            messageEl.innerHTML = "";
        })

        socket.on('join room success', async (value) => {
            const listData = dD(value);
            for (const data of listData) {
                messageEl.insertAdjacentHTML('beforeend', templateMessage(data, data.user.socketId === socket.id, messageEl))
            }
            setTimeout(() => {
                messageEl.scrollTo({
                    top: messageEl.scrollHeight - messageEl.clientHeight
                })
                window.dispatchEvent(eventUpdateAction);
                page = 2;
                pageLoadMore = false;
                loadMoreChat(messageEl)
            }, 100);
        })

        socket.on("chat-admin-client", (data) => {
            data = dD(data);

            messageEl.insertAdjacentHTML('beforeend', templateMessage(data, data.user.socketId === socket.id, messageEl))
            messageEl.scrollTo({
                behavior: "smooth",
                top: messageEl.scrollHeight - messageEl.clientHeight
            })

            window.dispatchEvent(eventUpdateAction);
        })

        socket.on("response-message-load", (value) => {
            const listData = dD(value);
            const loading = messageEl.querySelector('.load-more-message');
            if (loading) {
                loading.remove();
            }
            listData.forEach(data => {
                messageEl.insertAdjacentHTML('afterbegin', templateMessage(data, data.user.socketId === socket.id, messageEl))
                // Bắt buộc sử dụng fixed khi bắt hiển thị lên ok

            })
            window.dispatchEvent(eventUpdateAction);
            if (listData.length > 0) {
                pageLoadMore = false;
                page++
                loadMoreChat(messageEl)
            }
        })

        socket.on("feel-message-response", (value) => {
            const feelData = dD(value);
            // Kiểm tra là cuối thì sẽ scroll xuống cuối

            const messageItem = document.querySelector(`.message [data-id="${feelData.message_id}"]`);
            if (messageItem) {
                const content = messageItem.querySelector('.message-body');
                let createSpanFeel = content.querySelector('span.feel');
                if (!createSpanFeel) {
                    createSpanFeel = document.createElement('span');
                    createSpanFeel.className = "feel";
                }
                createSpanFeel.innerText = feelData.native;
                content.append(createSpanFeel);
            }

            const lastMessage = messageEl.children[messageEl.children.length - 1];
            if (lastMessage === messageItem) {
                messageEl.scrollTo({
                    top: messageEl.scrollHeight - messageEl.clientHeight
                })
            }
        })
    }

    async function handlePasteData(e) {
        // Lấy ra item hình ảnh từ dữ liệu dán
        let item = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type));
        // Kiểm tra xem có phải là hình ảnh không
        e.preventDefault();
        if (item) {
            if (!boxImageUpload) {
                createBoxImageUpload();
            }
            // Lấy blob của hình ảnh
            let file = item.getAsFile();
            // Tạo một đối tượng Image
            let img = new Image();
            // Khi hình ảnh được tải hoàn tất, chèn nó vào trang
            img.onload = function () {
                itemUploadMessage(this, newDataTransfer.items.length);
                newDataTransfer.items.add(file);
            };
            // Đặt đường dẫn của hình ảnh là URL của blob
            img.src = URL.createObjectURL(file);
        } else {
            let pastedText = (e.originalEvent || e).clipboardData.getData('text/plain');
            checkKeypress(pastedText);
            document.execCommand('insertText', false, pastedText);
        }
    }
    function itemUploadMessage(imageEl, file) {
        let info = {
            name: file.name,
            size: file.size,
            type: file.type,
            customId: file.customId
        };
        const itemEl = document.createElement('div');
        itemEl.className = 'item-image-add';
        itemEl.dataset.info = JSON.stringify(info);
        const closeEl = document.createElement('button');
        closeEl.className = "close-image-item";
        closeEl.type = "button";
        closeEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>`;
        itemEl.append(imageEl);
        itemEl.append(closeEl);
        listFileAddEl.appendChild(itemEl);
        closeEl.onclick = () => {
            const index = Array.from(newDataTransfer.files).findIndex(file => file.customId === info.customId);
            if (index !== -1) {
                newDataTransfer.items.remove(index);
                itemEl.remove();
                if (newDataTransfer.files.length === 0) {
                    boxImageUpload.remove()
                    boxImageUpload = undefined;
                }
            }
        }
        // Kích hoạt kiện kéo
        itemEl.draggable = true;

        itemEl.ondragstart = (e) => {
            itemDrag = itemEl;
        }

        itemEl.ondragover = (e) => {
            e.preventDefault();
            const itemTarget = e.target.closest('.item-image-add');
            if (itemTarget) {
                const rate = itemTarget.offsetWidth / 2;
                if (e.offsetX > rate) {
                    itemTarget.parentElement.insertBefore(itemTarget, itemDrag);
                } else if (e.offsetX <= rate) {
                    itemTarget.parentElement.insertBefore(itemDrag, itemTarget);
                }
            }
        }

        itemEl.ondrop = () => {
            itemDrag = undefined;
            sortDataUpload();
        }
    }
    // xử lý upload file ở chỗ này thôi
    function createBoxImageUpload() {
        boxImageUpload = document.createElement('div');
        boxImageUpload.className = "box-upload-image";
        buttonAddFileEl = document.createElement('button');
        buttonAddFileEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"/></svg>`;
        buttonAddFileEl.className = "btn-add-file-message";
        buttonAddFileEl.type = "button";
        listFileAddEl = document.createElement('div');
        listFileAddEl.className = "list-image-add";
        boxImageUpload.append(buttonAddFileEl, listFileAddEl);
        editorChatContent.prepend(boxImageUpload);
        buttonAddFileEl.onclick = e => {
            inputFile.click();
        };
        createScrollbar(boxImageUpload, buttonAddFileEl, listFileAddEl)
    }

    function addEventForItemMessage() {
        Array.from(messageEl.children).forEach((messageItem) => {
            const feelMart = messageItem.querySelector(".emoji-mart");
            feelMart.onclick = (e) => {
                let picker = new Picker({
                    data: emojiData,
                    i18n: langEmoji,
                    locale: 'vi',
                    set: 'facebook',
                    onClickOutside: function (e) {
                        // Cần kiểm tra nếu click ngoài thì tắt đi 
                        if (+picker.style.opacity === 1) {
                            picker.remove();
                        }
                    },
                    onEmojiSelect: function (e) {
                        socket.volatile.emit("feel-message", 'admin', userId, messageItem.dataset.id, e.native);
                        picker.remove();
                    }
                })
                picker.style.position = "fixed";
                picker.style.zIndex = "1";
                picker.style.opacity = 0;
                picker.className = "picker-emoji";
                document.body.append(picker);
                setTimeout(() => {
                    const rect = picker.getBoundingClientRect();
                    const top = e.pageY - rect.height - feelMart.offsetHeight;
                    picker.style.top = (top < 0 ? 0 : top) + "px";
                    picker.style.left = e.pageX - rect.width - feelMart.offsetWidth + "px";
                    picker.style.opacity = 1;
                }, 0);
            }
        })
    }

    function templateMessage(response, isMe, messageEl) {
        const { data, user } = response;
        const feel = (data.feels && data.feels.length > 0) ? data.feels[data.feels.length - 1] : null;
        const avatar = JSON.parse(user.avatar);
        const lastItem = messageEl.children[messageEl.children.length - 1];

        if (lastItem && lastItem.classList.contains('left') && lastItem.dataset.id === user.socketId && lastItem.querySelector('.avatar img')) {
            lastItem.querySelector('.avatar img').remove();
        }
        const content = getContentChat(data, feel);
        return `<div class="item-message ${isMe ? 'right' : 'left'}" data-id=${data.id}>
            ${isMe ? `` : `<div class="avatar">
                <img src="/${avatar.path_absolute}" alt="${user.fullname}" />
            </div>`}
            ${isMe ? `<div class="action-content">
                <button class="emoji-mart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                    <div class="shadow"></div>
                </button>
            </div>` : ''}
            ${content}
            ${isMe ? `` : `<div class="action-content">
                <button class="emoji-mart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                    <div class="shadow"></div>
                </button>
            </div>`}
        </div>`
    }

    function getContentChat(data, feel) {
        switch (data.type) {
            case 'message':
                return `<div class="message-body content">${data.message}
            ${feel ? `<span class="feel">${feel.native}</span>` : ``}
            </div>`;
            case 'sticker':
                return `<div class="message-body sticker">${data.message}
                        ${feel ? `<span class="feel">${feel.native}</span>` : ``}
                        </div>`;
            case 'emoji':
                return 2;
            case 'feel':
                return `<div class="message-body content-feel">${data.message}
            ${feel ? `<span class="feel">${feel.native}</span>` : ``}
            </div>`;
            case 'image':
                return `<div class="message-body image-message">
                <img src="${data.message}"/>
            ${feel ? `<span class="feel">${feel.native}</span>` : ``}
            </div>`
        }
    }

    function addEventSocketConnect() {
        setTimeout(() => {
            rectAction = actions.getBoundingClientRect()
            actionsWidth = rectAction.width;
            editorHeight = editorChat.offsetHeight;
        }, 500)
        Array.from(actions.children).forEach(button => {
            switch (button.dataset.type) {
                case 'sticker':
                    button.onmouseup = (e) => {
                        if (!stickerBox || stickerBox.classList.contains("hidden")) {
                            e.stopPropagation();
                            handleShowSticker(e, e.target);
                        }
                    };
                    break
                case 'image':
                    button.onclick = (e) => {
                        inputFile.click();
                    }
                    break;

            }
        })

        Array.from(listActionSub).forEach(button => {
            switch (button.dataset.type) {
                case 'sticker':
                    button.onmouseup = (e) => {
                        if (!stickerBox || stickerBox.classList.contains("hidden")) {
                            e.stopPropagation();
                            handleShowSticker(e, actionPlus);
                            handleActionPlusMouseDown();
                        }

                    }
                    break;
                case 'image':
                    button.onclick = () => {
                        inputFile.click();
                    }
                    break;
            }

        })
        editorChat.addEventListener('input', handleInput)
        editorChat.addEventListener('keyup', handleKeyup)
        editorChat.addEventListener('keydown', handleKeydown)
        // Xử lý sự kiên show action chat
        chatClose.addEventListener('click', handleDisconnect)

        actionMenuSub.addEventListener('mousedown', handleActionMenuMousedown)

        actionPlus.addEventListener('mousedown', handleActionPlusMouseDown)

        document.addEventListener('mouseup', handleDocumentAddSocket)

        formChat.addEventListener('submit-form-chat', handleChat)

        formChat.addEventListener('submit', handleChat)

        buttonFeel.addEventListener('click', handleShowFeel);
    }

    function handleShowFeel(e) {
        let picker = new Picker({
            data: emojiData,
            i18n: langEmoji,
            locale: 'vi',
            set: 'facebook',
            onClickOutside: function (e) {
                // Cần kiểm tra nếu click ngoài thì tắt đi 
                if (+picker.style.opacity === 1) {
                    picker.remove();
                }
            },
            onEmojiSelect: function (e) {
                editorChat.focus();
                document.execCommand("insertText", false, e.native);
                checkLengthEditor();
            }
        })
        picker.style.position = "fixed";
        picker.style.opacity = 0;
        picker.style.zIndex = 1;
        picker.className = "picker-emoji";

        document.body.append(picker);
        setTimeout(() => {
            const rect = picker.getBoundingClientRect();
            const top = e.pageY - rect.height - this.offsetHeight;
            picker.style.top = (top < 0 ? 0 : top) + "px";
            picker.style.left = e.pageX - rect.width + this.offsetWidth + "px";
            picker.style.opacity = 1;
        }, 0);
    }

    async function handleShowSticker(e, targetEl) {
        if (!stickerBox) {
            createAndAddEventStickerBox(e);
        } else {
            stickerBox.classList.remove("hidden");
        }
        setTimeout(() => {
            const rect = stickerBox.getBoundingClientRect();
            const rectTargetElement = targetEl.getBoundingClientRect();
            let left = rectTargetElement.left;
            let top = rectTargetElement.top - rect.height - rectTargetElement.height;
            if (left + stickerBox.offsetWidth > window.innerWidth) {
                left = window.innerWidth - stickerBox.offsetWidth - 20;
            }
            if (top < 0) {
                top = 0;
            }
            // Tổng = left + stickerBox.offsetWidth
            //  Phần thừa ra = rectTargetElement.left + rectTargetElement.width
            // Lấy tổng stickerBox - phần thưa ra số px left transform hiện tại
            let sumLeftAndWidthStickerBox = left + stickerBox.offsetWidth;
            let excessPart = sumLeftAndWidthStickerBox - rectTargetElement.left - rectTargetElement.width / 2;
            let leftTransitionForm = stickerBox.offsetWidth - excessPart;
            stickerBox.style.transformOrigin = `${leftTransitionForm}px ${stickerBox.offsetHeight}px`;
            stickerBox.style.top = top + "px";
            stickerBox.style.left = left + "px";
            stickerBox.style.opacity = 1;
        }, 200);
    }

    function createAndAddEventStickerBox(e) {
        const listTab = listStickers.map((item, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = "tab-item";
            tabElement.dataset.index = index;
            const image = document.createElement('img');
            image.src = item.label;
            tabElement.append(image);
            return tabElement;
        });
        stickerBox = document.createElement('div');
        stickerBox.className = "sticker-box";
        tabBox = document.createElement('div');
        tabBox.className = "tab-sticker-box";
        stickerItemList = document.createElement('div');
        stickerItemList.className = "sticker-items";
        tabBox.append(...listTab);
        stickerBox.append(tabBox, stickerItemList);
        stickerBox.style.opacity = 0;
        document.body.append(stickerBox);
        listTab.forEach((tab, index) => {
            tab.onclick = async (e) => {
                e.stopPropagation();
                if (tab.classList.contains('active')) return false;
                stickerItemList.style.display = "flex";
                stickerItemList.innerHTML = rsLoading(`width:100%;height:100%`);
                indexEmojiCurrent = +tab.dataset.index;
                let items = await Promise.all(listStickers[tab.dataset.index].items.map(item => {
                    return emojiUtil.emojiAll(item.url, item.imgUrl, item.totalRow, item.totalColumn, item.countLeftInTotalRow, item.ms)
                }).map(el => el));
                if (tabBox.querySelector('.active')) {
                    tabBox.querySelector('.active').classList.remove('active');
                }
                tab.classList.add('active');
                stickerItemList.style.display = "grid";
                stickerItemList.innerHTML = '';
                stickerItemList.append(...items);
                emojiUtil.addEventEmoji(stickerItemList);
            }
            if (indexEmojiCurrent === index) {
                setTimeout(() => {
                    tab.click();
                }, 0);
            }
        })
        stickerItemList.onmouseup = handleEventSendSticker
    }

    function handleEventSendSticker(e) {
        e.stopPropagation();
        if (e.target.classList.contains('emoji')) {
            sendSticker(e.target, e);
            stickerBox.classList.add("hidden");
        }
    }

    function checkLengthEditor() {
        if (editorChat.innerText.trim().length && !flagWidth) {
            flagWidth = true
            window.dispatchEvent(beforeResizeEditorChat)
            editorChat.nextElementSibling.classList.add('hidden');
            actions.style.overflow = "hidden";
            actions
                .animate(
                    [
                        {
                            width: `${actionsWidth}px`,
                        },
                        {
                            width: '26px',
                        },
                    ],
                    {
                        duration: 300,
                        fill: 'forwards',
                    }
                )
                .finished.then((response) => {
                    actions.classList.add('hidden')
                    actionPlus.classList.remove('hidden');
                    window.dispatchEvent(resizeEditorChat);
                })
            return true;
        }
        return false
    }

    function handleInput(e) {
        checkKeypress(e);
        // Kiểm nha nếu độ dài lớn hơn độ dài trước thì thay đổi
        if (e.target.offsetHeight != editorHeight) {
            editorHeight = e.target.offsetHeight;
            window.dispatchEvent(beforeResizeEditorChat)
            window.dispatchEvent(resizeEditorChat);
        }
    }

    function handleKeyup(e) {
        checkLengthEditor()
        if (editorChat.innerText.trim().length === 0) {
            flagWidth = false
            window.dispatchEvent(beforeResizeEditorChat)
            editorChat.nextElementSibling.classList.remove('hidden');
            actions.classList.remove('hidden')
            actionPlus.classList.add('hidden')
            actions
                .animate(
                    [
                        {
                            width: `${actionsWidth}px`,
                        },
                    ],
                    {
                        duration: 300,
                        fill: 'forwards',
                    }
                )
                .finished.then((response) => {
                    actions.style.overflow = null;
                    window.dispatchEvent(resizeEditorChat);
                })
        }
        const oldContent = editorChat.innerHTML;
        if (oldContent.slice(oldContent.length - 2, oldContent.length - 1) === ':') {
            let newString = convertStringToEmoji(oldContent);
            if (newString) {
                editorChat.innerHTML = ''
                newString && document.execCommand('insertHTML', false, newString);
            }
        }
    }

    function checkKeypress(e, data = false) {
        if (!flagWidth && (!e.ctrlKey || data)) {
            flagWidth = true
            window.dispatchEvent(beforeResizeEditorChat)
            editorChat.nextElementSibling.classList.add('hidden');
            actions.style.overflow = "hidden";
            actions
                .animate(
                    [
                        {
                            width: `${actionsWidth}px`,
                        },
                        {
                            width: '26px',
                        },
                    ],
                    {
                        duration: 300,
                        fill: 'forwards',
                    }
                )
                .finished.then((response) => {
                    actions.classList.add('hidden')
                    actionPlus.classList.remove('hidden')
                    window.dispatchEvent(resizeEditorChat);
                })
        }
    }

    function handleKeydown(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            submitEventChat.typeMessage = "message";
            formChat.dispatchEvent(submitEventChat)
            return false;
        }
    }

    function handleChat(e) {
        e.preventDefault();
        // Kiểm tra xem có phải chỉ có emoji hay không
        // Kiểm tra có file trước hay không
        if (newDataTransfer.files.length) {
            e.typeMessage = "file"
        } else if (stringVietnamese.test(editorChat.innerText)) {
            e.typeMessage = "message";
        } else {
            e.typeMessage = "feel";
        }
        chat(editorChat.innerText, e);
        editorChat.innerText = "";
    }

    function handleShowChat() {
        buttonShowChatBox.onclick = function () {
            socket.typeRoom = 1
            socket.connect()
            addSocketEvent()
        }
    }

    function handleDisconnect(e) {
        socket.disconnect()
        chatHTML.classList.remove('show')
    }

    function handleActionMenuMousedown(e) {
        e.stopPropagation()
    }

    function handleActionPlusMouseDown() {
        actionMenuSub.classList.toggle('active')
    }

    function handleDocumentAddSocket(e) {
        if (!e.target.closest('.action-plus')) {
            actionMenuSub.classList.remove('active')
        }

        if (stickerBox && !stickerBox.classList.contains('hidden') && !e.target.closest(".sticker-box")) {
            stickerBox.classList.add('hidden');
        }
    }

    async function chat(data, event) {
        if (event.typeMessage === 'file') {
            let dataFile = {
                files: [],
                stringData: null,
            };
            for (const file of newDataTransfer.files) {
                const base64 = await getBase64(file);
                dataFile.files.push({
                    size: file.size,
                    type: file.type,
                    base64
                })
            }
            dataFile.stringData = data;
            socket.volatile.emit('chat-admin-socket', 'admin', userId, eD(dataFile), event.typeMessage);
            newDataTransfer = new DataTransfer();
            boxImageUpload.remove();
            boxImageUpload = undefined;
        } else {
            socket.volatile.emit('chat-admin-socket', 'admin', userId, eD(data), event.typeMessage);
        }
    }

    function sendSticker(elementSticker, event) {
        event.typeMessage = "sticker";
        let newElement = document.createElement('span');
        newElement.innerHTML = `<img src="${elementSticker.getAttribute('image-url')}" width="${elementSticker.getAttribute('width-one')}" height="${elementSticker.getAttribute('height-one')}">`
        socket.volatile.emit('chat-admin-socket', 'admin', userId, eD(newElement.outerHTML), event.typeMessage);
    }

    async function loadMoreChat(element) {
        let elementHeading = element.children[0];
        observer = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && +entry.intersectionRatio != 0 && !pageLoadMore) {
                    pageLoadMore = true;
                    observer.disconnect();
                    socket.volatile.emit("load-more-message", 'admin', userId, page);
                    const loading = document.createElement('div');
                    loading.className = "load-more-message";
                    loading.innerHTML = rsLoading(`width:100%;height:100%`);
                    element.prepend(loading);
                }
            }
        }, {
            root: element
        });
        elementHeading && observer.observe(elementHeading)
    }

    function handleInputFile() {
        inputFile.type = "file";
        inputFile.multiple = true;
        inputFile.accept = ".jpg,.png,.jpeg,.gif,.webp,.tiff";
        inputFile.addEventListener('change', (e) => {
            if (!boxImageUpload) {
                createBoxImageUpload();
            }
            Array.from(e.target.files).forEach(file => {
                const url = URL.createObjectURL(file);
                const image = new Image();
                image.onload = function () {
                    let randomString = Math.random().toString(36).toString(36).substring(2) + new Date().getTime().toString(36).substring(2);
                    file.customId = randomString;
                    itemUploadMessage(this, file);
                    newDataTransfer.items.add(file);
                }
                image.src = url;
            })
        })
    }

    function sortDataUpload() {
        let refreshDataTransfer = new DataTransfer();
        for (const fileEl of listFileAddEl.children) {
            const info = JSON.parse(fileEl.dataset.info);
            const index = Array.from(newDataTransfer.files).findIndex(file => isSameFile(file, info));
            if (index !== -1) {
                refreshDataTransfer.items.add(newDataTransfer.files[index]);
            }
        }
        newDataTransfer = refreshDataTransfer;
    }

    function isSameFile(file, infoFile) {
        return file.name === infoFile.name && file.size === infoFile.size && file.customId === infoFile.customId && file.type === infoFile.type;
    }
    return {
        init: () => {
            handleShowChat();
            handleInputFile();
        },
    }
})()

export default CHAT
