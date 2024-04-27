import socket from "./socket.js";
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
let isAlreadyCalling = {};
const { RTCPeerConnection, RTCSessionDescription } = window;

socket.connect();
// RSMEET._();
const form = document.querySelector('form.room');
let roomNameInput = form.querySelector('input');
const peerConnection = new RTCPeerConnection();
const roomAction = document.querySelector('.room-action');
const muteBtn = roomAction.querySelector(".mute");
const leaveRoom = roomAction.querySelector(".leave-room");
const hideCamera = roomAction.querySelector(".hide-camera");
const roomMain = document.querySelector('.room-main');
const remoteVideo = document.getElementById("remote-video");
const localVideo = document.getElementById("local-video");
let roomName = roomNameInput.value;
form.onsubmit = (e) => {
    e.preventDefault();
    roomName = roomNameInput.value;
    socket.emit("join", roomName);
}

socket.on("ready", (otherUsers) => {
    navigator.getUserMedia(
        { video: true, audio: true },
        stream => {
            roomAction.style.display = "flex";
            if (localVideo) {
                localVideo.srcObject = stream;
                localVideo.onloadedmetadata = () => {
                    localVideo.play();
                }
            }
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            for (const socketId of otherUsers) {
                isAlreadyCalling[socketId] = false;
                callUser(socketId)
            }
        },
        error => {
            console.warn(error.message);
        }
    );
})
muteBtn.onclick = () => {
    if (muteBtn.innerText === "Mute") {
        for (const track of localVideo.srcObject.getTracks()) {
            if (track.kind === "audio") {
                track.enabled = false;
            }
        }
        muteBtn.innerText = "Un mute"
    } else {
        for (const track of localVideo.srcObject.getTracks()) {
            if (track.kind === "audio") {
                track.enabled = true;
            }
        }
        muteBtn.innerText = "Mute"
    }
}

hideCamera.onclick = () => {
    if (hideCamera.innerText === "Hide Camera") {
        for (const track of localVideo.srcObject.getTracks()) {
            if (track.kind === "video") {
                track.enabled = false;
            }
        }
        hideCamera.innerText = "Show Camera"
    } else {
        for (const track of localVideo.srcObject.getTracks()) {
            if (track.kind === "video") {
                track.enabled = true;
            }
        }
        hideCamera.innerText = "Hide Camera"
    }
}



socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
});

socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);

    if (elToRemove) {
        elToRemove.remove();
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
        // unselectUsersFromList();
        userContainerEl.setAttribute("class", "active-user active-user--selected");
        const talkingWithInfo = document.getElementById("talking-with-info");
        talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
        callUser(socketId);
    });
    return userContainerEl;
}

async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
});

socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyCalling[data.socket]) {
        callUser(data.socket);
        isAlreadyCalling[data.socket] = true;
    }
});

peerConnection.ontrack = function ({ streams: [stream] }) {
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.onloadedmetadata = () => {
            remoteVideo.play();
        }
    }
};