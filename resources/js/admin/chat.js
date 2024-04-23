import socket from './socket.js';
import utils from '../utils/utils.js';
import listStickers from '../sticker/list.js';
import emojiUtil from '../sticker/showImage.js';
import emojiData from '@emoji-mart/data/sets/14/facebook.json'
import { Picker } from 'emoji-mart'
import langEmoji from './emoji-lang-vi.js';
import { convertStringToEmoji } from '../utils/emoji-convert.js';
const submitEventChat = new Event('submit-form-chat');
const eventUpdateAction = new Event("update-action-message-item");
const CHAT = (() => {
    const chatBox = document.querySelector('.chat-box-admin')
    const buttonShowChatBox = chatBox.querySelector('.show-chat-box')
    const chatHTML = chatBox.querySelector('.chat-content')
    const messageEl = chatHTML.querySelector('.message');
    const formChat = chatHTML.querySelector('.form-chat');
    const buttonFeel = formChat.querySelector('[data-type="icon"]');
    const editorChat = chatHTML.querySelector('.editor-chat');
    const actions = chatHTML.querySelector('.actions')
    const chatContentHeader = chatHTML.querySelector('.chat-content-header')
    const chatClose = chatContentHeader.querySelector('.chat-close')
    const actionPlus = chatHTML.querySelector('.action-plus');
    const actionMenuSub = actionPlus.querySelector('.action-sub-menu');
    const listActionSub = actionMenuSub.querySelector('ul');
    let stickerBox = null;
    let tabBox = null;
    let stickerItemList = null;
    const userId = chatBox.dataset.userId;
    let observer;
    let indexEmojiCurrent = 0;
    let page = 2;
    let pageLoadMore = false;
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
            window.addEventListener('update-action-message-item', addEventForItemMessage)
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
            chatHTML.classList.remove('show')
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

        socket.on('join room success', (value) => {
            const listData = utils.dD(value);
            listData.forEach(data => {
                messageEl.insertAdjacentHTML('beforeend', templateMessage(data, data.user.socketId === socket.id, messageEl))
            })
            window.dispatchEvent(eventUpdateAction);
            messageEl.scrollTo({
                top: messageEl.scrollHeight - messageEl.clientHeight
            })
            page = 2;
            pageLoadMore = false;
            loadMoreChat(messageEl)
        })

        socket.on("chat-admin-client", (data) => {
            data = utils.dD(data);

            messageEl.insertAdjacentHTML('beforeend', templateMessage(data, data.user.socketId === socket.id, messageEl))
            messageEl.scrollTo({
                behavior: "smooth",
                top: messageEl.scrollHeight - messageEl.clientHeight
            })

            window.dispatchEvent(eventUpdateAction);
        })

        socket.on("response-message-load", (value) => {
            const listData = utils.dD(value);
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
            const feelData = utils.dD(value);
            const content = document.querySelector(`.message [data-id="${feelData.message_id}"] .message-body`);
            if (content) {
                let createSpanFeel = content.querySelector('span.feel');
                if (!createSpanFeel) {
                    createSpanFeel = document.createElement('span');
                    createSpanFeel.className = "feel";
                }
                createSpanFeel.innerText = feelData.native;
                content.append(createSpanFeel);
            }
        })
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
            case 'gif':
                return 4;
        }
    }

    function addEventSocketConnect() {
        setTimeout(() => {
            rectAction = actions.getBoundingClientRect()
            actionsWidth = rectAction.width
        }, 500)
        Array.from(actions.children).forEach(button => {
            if (button.dataset.type === "sticker") {
                button.onmouseup = (e) => {
                    if (!stickerBox || stickerBox.classList.contains("hidden")) {
                        e.stopPropagation();
                        handleShowSticker(e);
                    }
                };
            }
        })
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
                if (editorChat.innerText.length && !flagWidth) {
                    flagWidth = true
                    editorChat.nextElementSibling.style.opacity = 0;
                }
            }
        })
        picker.style.position = "fixed";
        picker.style.opacity = 0;
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

    async function handleShowSticker(e) {
        if (!stickerBox) {
            createAndAddEventStickerBox(e);
        } else {
            stickerBox.classList.remove("hidden");
        }
        setTimeout(() => {
            const rect = stickerBox.getBoundingClientRect();
            const rectTargetElement = e.target.getBoundingClientRect();
            stickerBox.style.top = rectTargetElement.top - rect.height - rectTargetElement.height + "px";
            stickerBox.style.left = rectTargetElement.left + "px";
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
                stickerItemList.innerHTML = `<style>.rs-loading-main{display: flex;width:100%;height:100%; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
                indexEmojiCurrent = +tab.dataset.index;
                let items = await Promise.all(listStickers[tab.dataset.index].items.map(item => {
                    console.log(item);
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

    function handleKeyup(e) {
        if (editorChat.innerText.length && !flagWidth) {
            flagWidth = true
            editorChat.nextElementSibling.style.opacity = 0;
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
                })
        } else if (editorChat.innerText.length === 0 && flagWidth) {
            flagWidth = false
            editorChat.nextElementSibling.style.opacity = 1
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

    function handleKeydown(e) {
        if (editorChat.innerText.length && !flagWidth) {
            flagWidth = true
            editorChat.nextElementSibling.style.opacity = 0;
        }
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
        const pattern = /[\d\w\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/;

        if (pattern.test(editorChat.innerText)) {
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

    function chat(data, event) {
        socket.volatile.emit('chat-admin-socket', 'admin', userId, utils.eD(data), event.typeMessage);
    }

    function sendSticker(elementSticker, event) {
        event.typeMessage = "sticker";
        let newElement = document.createElement('span');
        newElement.innerHTML = `<img src="${elementSticker.getAttribute('image-url')}" width="${elementSticker.getAttribute('width-one')}" height="${elementSticker.getAttribute('height-one')}">`
        socket.volatile.emit('chat-admin-socket', 'admin', userId, utils.eD(newElement.outerHTML), event.typeMessage);
    }

    async function loadMoreChat(element) {
        let elementHeading = element.children[0];
        observer = new IntersectionObserver(async (entries) => {
            for (let i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting && +entries[i].intersectionRatio != 0 && !pageLoadMore) {
                    pageLoadMore = true;
                    observer.disconnect();
                    socket.volatile.emit("load-more-message", 'admin', userId, page);
                    const loading = document.createElement('div');
                    loading.className = "load-more-message";
                    loading.innerHTML = `<style>.rs-loading-main{display: flex;width:100%;height:100%; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
                    element.prepend(loading);
                }
            }
        }, {
            root: element
        });
        elementHeading && observer.observe(elementHeading)
    }

    return {
        init: () => {
            handleShowChat()
        },
    }
})()

export default CHAT
