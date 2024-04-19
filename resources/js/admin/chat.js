import socket from './socket.js';

const CHAT = (() => {
    const chatBox = document.querySelector('.chat-box-admin');
    const buttonShowChatBox = chatBox.querySelector('.show-chat-box');
    const chatHTML = chatBox.querySelector('.chat-content');
    function addEvent() {
        socket.on('connect', () => {
        })

        socket.on('connect_error', () => {
            console.log(2);
        })

        socket.on('disconnect', () => {
            console.log(3);
        })
    }

    function addEventConnect() {
        const editorChat = chatHTML.querySelector('.editor-chat');
        const actions = chatHTML.querySelector('.actions');
        const formChat = chatHTML.querySelector('.form-chat');
        const actionPlus = chatHTML.querySelector('.action-plus');
        const rectAction = actions.getBoundingClientRect();
        const actionsWidth = rectAction.width;
        var newAction = actions.cloneNode(true);
        let flagWidth = false
        editorChat.addEventListener('input', (e) => {
            if (e.target.innerText.length && !flagWidth) {
                flagWidth = true
                e.target.nextElementSibling.style.opacity = 0;
                actions.animate([{
                    width: `${actionsWidth}px`
                }, {
                    width: "26px"
                }], {
                    duration: 300,
                    fill: "forwards"
                }).finished.then(response => {
                    actions.classList.add("hidden");
                    actionPlus.classList.remove("hidden");
                })

            } else if (e.target.innerText.length === 0 && flagWidth) {
                flagWidth = false;
                e.target.nextElementSibling.style.opacity = 1;
                actions.classList.remove("hidden");
                actionPlus.classList.add("hidden");
                actions.animate([{
                    width: `${actionsWidth}px`
                }], {
                    duration: 300,
                    fill: "forwards"
                }).finished.then(response => {
                    // actions.
                });
            }
        })
    }

    function handleShowChat() {
        buttonShowChatBox.addEventListener('click', function () {
            socket.connect();
            addEvent();
        })
    }
    return {
        init: () => {
            handleShowChat();
            addEventConnect();
        },
    }
})()

export default CHAT;