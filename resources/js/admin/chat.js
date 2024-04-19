import socket from './socket.js'
import utils from '../utils/utils.js'
const submit = new Event('submit-form-chat')
const CHAT = (() => {
    const chatBox = document.querySelector('.chat-box-admin')
    const buttonShowChatBox = chatBox.querySelector('.show-chat-box')
    const chatHTML = chatBox.querySelector('.chat-content')
    const messageEl = chatHTML.querySelector('.message');
    const formChat = chatHTML.querySelector('.form-chat')
    const editorChat = chatHTML.querySelector('.editor-chat')
    const actions = chatHTML.querySelector('.actions')
    const chatContentHeader = chatHTML.querySelector('.chat-content-header')
    const chatClose = chatContentHeader.querySelector('.chat-close')
    const actionPlus = chatHTML.querySelector('.action-plus')
    const actionMenuSub = actionPlus.querySelector('.action-sub-menu')
    const userId = chatBox.dataset.userId;
    let flagWidth = false,
        rectAction,
        actionsWidth,
        addEventNow = false;

    function addEvent() {
        if(addEventNow) return;
        addEventNow = true;
        socket.on('connect', () => {            
            chatHTML.classList.add('show')
            addEventConnect()
            socket.emit(
                'connect-admin-socket',
                'admin',
                userId,
            )
        })


        socket.on('connect_error', () => {
            console.log(2)
        })

        socket.on('disconnect', () => {
            formChat.removeEventListener('submit-form-chat', handleChat)
            editorChat.removeEventListener('keyup', handleKeyup)
            editorChat.removeEventListener('keydown', handleKeydown)
            chatClose.removeEventListener('keyup', handleDisconnect)
            actionMenuSub.removeEventListener(
                'mousedown',
                handleActionMenuMousedown
            )
            actionPlus.removeEventListener(
                'mousedown',
                handleActionPlusMouseDown
            )
        })

        socket.on('join room success', (value) => {
            console.log(value)
        })

        socket.on("chat-admin-client", (data) => {
            data = utils.dD(data);
            messageEl.insertAdjacentHTML('beforeend', templateMessage(data, data.user.socketId === socket.id, messageEl))
            messageEl.scrollTo({
                behavior:"smooth",
                top: messageEl.scrollHeight - messageEl.clientHeight 
            })
        })
    }

    function templateMessage(response, isMe, messageEl) {
        const { data, user } = response;
        const avatar = JSON.parse(user.avatar);
        const lastItem = messageEl.children[messageEl.children.length - 1];

        if (lastItem && lastItem.classList.contains('left') && lastItem.dataset.id === user.socketId && lastItem.querySelector('.avatar img')) {
            lastItem.querySelector('.avatar img').remove();
        }
        return `<div class="${isMe ? 'right' : 'left'}" data-id=${user.socketId}>
            ${isMe ? `` : `<div class="avatar">
                <img src="/${avatar.path_absolute}" alt="${user.fullname}" />
            </div>`}
            <div class="content">${response.data.message}</div>
        </div>`
    }

    function addEventConnect() {
        setTimeout(() => {
            rectAction = actions.getBoundingClientRect()
            actionsWidth = rectAction.width
        }, 500)

        editorChat.addEventListener('keyup', handleKeyup)
        editorChat.addEventListener('keydown', handleKeydown)
        // Xử lý sự kiên show action chat
        chatClose.addEventListener('click', handleDisconnect)

        actionMenuSub.addEventListener('mousedown', handleActionMenuMousedown)

        actionPlus.addEventListener('mousedown', handleActionPlusMouseDown)

        document.addEventListener('mousedown', handleDocumentAddSocket)

        formChat.addEventListener('submit-form-chat', handleChat)

        formChat.addEventListener('submit', handleChat)
    }
    function handleKeyup() {
        if (editorChat.innerText.length && !flagWidth) {
            flagWidth = true
            editorChat.nextElementSibling.style.opacity = 0
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
                    // actions.
                })
        }
    }
    function handleKeydown(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            formChat.dispatchEvent(submit)
            return false;
        }
    }
    function handleChat(e) {
        e.preventDefault();
        chat(editorChat.innerText);
    }
    function handleShowChat() {
        buttonShowChatBox.onclick = function () {
            socket.typeRoom = 1
            socket.connect()
            addEvent()
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
    }

    async function chat(data) {
        socket.volatile.emit('chat-admin-socket', 'admin', userId, utils.eD(data));
    }
    return {
        init: () => {
            handleShowChat()
            addEventConnect()
        },
    }
})()

export default CHAT
