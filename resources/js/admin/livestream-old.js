
const { RTCPeerConnection, RTCSessionDescription } = window;
import socket from "./socket.js";
// Đầu tiên phải kiểm tra xem cam có bật hay không
// Sau đó khi vào phòng nếu cam mở thì tự động thêm luôn
const listVideoCall = document.querySelector('.list-video-call');
const listVideoShare = document.querySelector('.list-video-share');
let isAlreadyCalling = false;
let isAlreadyShare = false;
let peers = {
    cams: {},
    screens: {}
};


socket.on('connect', async () => {
    const textNode = document.createTextNode(socket.id);
    document.body.prepend(textNode)
})

socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
    for (const socketId of users) {
        if (!peers.cams[socketId]) {
            peers.cams[socketId] = new RTCPeerConnection();
        }
        if (!peers.screens[socketId]) {
            peers.screens[socketId] = new RTCPeerConnection();
        }
    }
    addEventListenerPeerOnTrack();
});

socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
    if (elToRemove) {
        elToRemove.remove();
    }
    if (peers.cams[socketId]) {
        delete peers.cams[socketId];
    }

    if (peers.screens[socketId]) {
        delete peers.screens[socketId];
    }
});

function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");
    socketIds.forEach(socketId => {
        const alreadyExistingUser = document.getElementById(socketId);
        if (!alreadyExistingUser) {
            const userContainerEl = createUserItemContainer(socketId);
            activeUserContainer.appendChild(userContainerEl);
        }
    });
}

function createUserItemContainer(socketId) {
    const userContainerEl = document.createElement("div");
    const usernameEl = document.createElement("p");
    userContainerEl.setAttribute("class", "active-user");
    userContainerEl.setAttribute("id", socketId);
    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `Socket: ${socketId}`;
    userContainerEl.appendChild(usernameEl);
    userContainerEl.addEventListener("click", () => {
        userContainerEl.setAttribute("class", "active-user active-user--selected");
        const talkingWithInfo = document.getElementById("talking-with-info");
        talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}" <button class="share-screen">Share screen</button>`;
        for (let socketId of getPeerType('cams', socket.id)) {
            callUser(socketId);
        }

        const buttonShareScreen = talkingWithInfo.querySelector('.share-screen');
        addEventShareAll(buttonShareScreen);
    });
    return userContainerEl;
}

function getPeerType(type, socketId) {
    return Object.keys(peers[type]).filter(id => id !== socketId);
}

async function callUser(socketId) {
    const offer = await peers.cams[socketId].createOffer();
    await peers.cams[socketId].setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

socket.on("call-made", async data => {
    await await peers.cams[data.socket].setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    const answer = await await peers.cams[data.socket].createAnswer();
    await await peers.cams[data.socket].setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
});

socket.on("answer-made", async data => {
    await peers.cams[data.socket].setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );
    if (!isAlreadyCalling) {
        for (let socketId of getPeerType('cams', socket.id)) {
            callUser(socketId);
        }
        isAlreadyCalling = true;
    }
});

const constraints = {
    audio: false,
    video: { width: 300, height: 200 },
};



function addEventListenerPeerOnTrack() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((mediaStream) => {
            for (const socketId of getPeerType('cams', socket.id)) {
                mediaStream.getTracks().forEach(track => peers.cams[socketId].addTrack(track, mediaStream));
            }
            // if (localVideo) {
            //     localVideo.srcObject = mediaStream;
            // }
            // localVideo.play();
        },
            error => {
                console.warn(error.message);
            }
        );

    for (const socketId of Object.keys(peers.cams)) {
        peers.cams[socketId].ontrack = function ({ streams: [stream] }) {
            if (!peers.cams[socketId].elementVideo) {
                peers.cams[socketId].elementVideo = document.createElement('video');
                peers.cams[socketId].elementVideo.className = "video-call";
                peers.cams[socketId].elementVideo.dataset.socketId = socketId;
                listVideoCall.append(peers.cams[socketId].elementVideo);
            }
            if(!peers.cams[socketId].elementVideo.srcObject){
                peers.cams[socketId].elementVideo.srcObject = stream;
            }
            peers.cams[socketId].elementVideo.onloadeddata = () => {
                peers.cams[socketId].elementVideo.play();
            }
        };
    }

    for (const socketId of Object.keys(peers.screens)) {
        peers.screens[socketId].ontrack = function ({ streams: [stream] }) {
            if (!peers.screens[socketId].elementVideo) {
                peers.screens[socketId].elementVideo = document.createElement('video');
                peers.screens[socketId].elementVideo.className = "video-share";
                peers.screens[socketId].elementVideo.dataset.socketId = socketId;
                listVideoShare.append(peers.screens[socketId].elementVideo);
            }

            if(!peers.screens[socketId].elementVideo.srcObject){
                peers.screens[socketId].elementVideo.srcObject = stream;
            }
            peers.screens[socketId].elementVideo.onloadeddata = () => {
                peers.screens[socketId].elementVideo.play();
            }
        }
    }
}

socket.on("share-screen-made", async data => {
    await peers.screens[data.socket].setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    const answer = await peers.screens[data.socket].createAnswer();
    await peers.screens[data.socket].setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("make-screen-answer", {
        answer,
        to: data.socket,
    });
})

socket.on("answer-share-screen-made", async data => {
    await peers.screens[data.socket].setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyShare) {
        for (const socketId of getPeerType('screens', socket.id)) {
            shareScreen(socketId);
        }
        isAlreadyShare = true;
    }
})

function addEventShareAll(buttonShareScreen) {
    buttonShareScreen.onclick = async () => {
        if (isAlreadyShare) {
            stopShare();
        } else {
            try {
                const mediaStream = await startCapture(displayMediaOptions);
                for (const socketId of getPeerType('screens', socket.id)) {
                    mediaStream.getTracks().forEach(track => peers.screens[socketId].addTrack(track, mediaStream));
                    shareScreen(socketId);
                }

            } catch (e) {
                console.log("Hủy không share nữa");
            }
        }
        // Chỉnh chỗ này để có thể share cho tất cả mọi người
    }
}

const displayMediaOptions = {
    video: {
        displaySurface: "monitor",
    },
    audio: {
        suppressLocalAudioPlayback: true,
    },
    preferCurrentTab: false,
    selfBrowserSurface: "exclude",
    systemAudio: "include",
    surfaceSwitching: "include",
    monitorTypeSurfaces: "include",
};

async function startCapture(displayMediaOptions) {
    let captureStream;

    try {
        captureStream =
            await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
    return captureStream;
}


async function shareScreen(socketId) {
    const offer = await peers.screens[socketId].createOffer();
    await peers.screens[socketId].setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("share-screen-for-user", {
        offer,
        to: socketId
    })
}

socket.connect();