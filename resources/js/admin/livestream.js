import socket from "./socket.js";
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
const { RTCSessionDescription } = window;
import { PeerRS } from "../web-rtc/peer.js";

socket.connect();
const form = document.querySelector('form.room');
let roomNameInput = form.querySelector('input');
const roomAction = document.querySelector('.room-action');
const muteBtn = roomAction.querySelector(".mute");
const shareRoom = roomAction.querySelector('.share-screen');
const leaveRoom = roomAction.querySelector(".leave-room");
const hideCamera = roomAction.querySelector(".hide-camera");
const roomMain = document.querySelector('.room-main');
const roomScreenMain = document.querySelector('.room-screen');
const localVideo = document.getElementById("local-video");
let roomName = roomNameInput.value;

const peerRS = new PeerRS({
    rootEl: roomMain,
    rootScreenEl: roomScreenMain,
}, {
    userMediaOptions: {
        audio: true,
        video: true
    }, offerOptions: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    },
    displayMediaOptions: {
        video: {
            displaySurface: "browser",
        },
        audio: {
            suppressLocalAudioPlayback: false,
        },
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
    }
}
);

form.onsubmit = (e) => {
    e.preventDefault();
    roomName = roomNameInput.value;
    socket.emit("join", roomName);
}

socket.on("ready", async (otherUsers, userStream) => {
    const stream = await peerRS.getUserMedia();
    if (!stream) {
        alert('Không hỗ trợ!')
        return false;
    }
    peerRS.setLocalStream(stream);
    if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.onloadedmetadata = () => {
            localVideo.play();
        }

    }
    if (peerRS.peers[socket.id]) {
        peerRS.peers[socket.id].isAlreadyCalling = false;
    }
    if (!peerRS.peers[socket.id]) {
        await peerRS.addPeer(socket.id);
        showForm(true);
    }

    // stream.getTracks().forEach(track => peers[socket.id].local.addTrack(track, stream));
    for (const socketId of otherUsers) {
        if (!peerRS.peers[socketId]) {
            await peerRS.addPeer(socketId);
            socket.emit("done-add", roomName, socket.id, 'call');
        }
    }
    for (const socketId of userStream) {

        await peerRS.addPeerStream(socketId);
        socket.emit("add-stream-done", roomName, socketId);
    }

})

function showForm(isShow = true) {
    form.style.display = isShow ? "none" : null;
    roomMain.style.display = isShow ? "flex" : null;
    roomAction.style.display = isShow ? "flex" : null;
}
socket.on("update-user-list", async ({ users }) => {
    let count = 0;
    await new Promise(async resolve => {
        for (const socketId of users) {
            if (!peerRS.peers[socketId]) {
                await peerRS.addPeer(socketId);
                count++;
            }
        }
        if (count == users.length) {
            resolve(peerRS.peers);
        }
    })
    socket.emit("done-add", roomName, socket.id, "call");
});

// Bước này chỉ để nhận socketId từ máy chuẩn bị stream còn có sẵn peer rùi thì gọi thẳng bước ở bên trong là xong
socket.on('start-stream', async (socketId) => {
    await peerRS.addPeerStream(socketId);
    socket.emit("add-stream-done", roomName, socketId);
})

// Từ màn stream gọi đến các màn đã có kết nối vào
socket.on("call-stream-now", async (socketId) => {
    await peerRS.addPeerStream(socketId);
    callStream(socketId);
})


socket.on("done-call-start", (type) => {
    for (let socketId of Object.keys(peerRS.peers)) {
        switch (type) {
            case 'call':
                if (!peerRS.peers[socketId].isAlreadyCalling) {
                    callUser(socketId);
                }
                break;
        }
    }
})


async function callStream(socketId) {
    // Sau đó mới bắt đầu createOffer
    let offer = await peerRS.peers[socketId].localScreen.createOffer(peerRS.options.offerOptions);
    await peerRS.peers[socketId].localScreen.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-stream", {
        offer,
        to: socketId
    });
}

socket.on("call-stream", async (data) => {
    await peerRS.peers[data.socket].remoteScreen.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerRS.peers[data.socket].remoteScreen.createAnswer();
    await peerRS.peers[data.socket].remoteScreen.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("make-stream", {
        answer,
        to: data.socket
    })
})

socket.on("answer-stream", async (data) => {
    await peerRS.peers[data.socket].localScreen.setRemoteDescription(new RTCSessionDescription(data.answer));
    if (!peerRS.peers[data.socket].isAlreadyStream) {
        peerRS.peers[data.socket].isAlreadyStream = true;
        callStream(data.socket);
    }
})

async function callUser(socketId) {
    // Sau đó mới bắt đầu createOffer
    let offer = await peerRS.peers[socketId].local.createOffer(peerRS.options.offerOptions);
    await peerRS.peers[socketId].local.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

// Call made này chính là id của thằng được gọi lúc này và call made thì đã qua socket chạy đến thằng đấy rồi
socket.on("call-made", async data => {
    const { remote } = peerRS.peers[data.socket]
    await remote.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    let answer = peerRS.peers[data.socket].answer;
    if (remote.signalingState === 'have-remote-offer' || remote.signalingState === "have-local-pranswer") {
        answer = await remote.createAnswer();
        peerRS.peers[data.socket].answer = answer;
        await remote.setLocalDescription(new RTCSessionDescription(answer));
    }

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
});

// Trả lời cho thằng hiện tại
socket.on("answer-made", async data => {
    await peerRS.peers[data.socket].local.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );
    if (!peerRS.peers[data.socket].isAlreadyCalling) {
        peerRS.peers[data.socket].isAlreadyCalling = true;
        callUser(data.socket);
    }
});

socket.on("leave-room-now", (socketId) => {
    peerRS.remotePeerLocal(socketId);
    peerRS.remotePeerRemoteStream(socketId);
    delete peerRS.peers[socketId];
    if (socketId === socket.id) {
        if (localVideo.srcObject && localVideo.srcObject.getTracks()) {
            for (const track of localVideo.srcObject.getTracks()) {
                track.stop();
            }
            localVideo.srcObject = null;
        }

        for (const socketIdRemote of Object.keys(peerRS.peers)) {
            peerRS.removePeerRemote(socketIdRemote);
            peerRS.remotePeerRemoteStream(socketIdRemote);
            delete peerRS.peers[socketIdRemote];
        }
        socket.emit("check-room-after-leave", roomName, socketId);
        showForm(false);
    }
})
// Xử lý các hành động
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

shareRoom.onclick = async () => {
    let screenStream = await peerRS.startCapture();
    peerRS.setScreenStream(screenStream);
    peerRS.addPeerStream(socket.id);
    socket.emit("stream-screen", roomName, socket.id);
}

leaveRoom.onclick = async () => {
    socket.emit("leave-room", roomName);
}