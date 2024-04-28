import socket from "./socket.js";
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
let isAlreadyCalling = {};
let isAlreadyStream = {};
const { RTCPeerConnection, RTCSessionDescription } = window;

socket.connect();
const form = document.querySelector('form.room');
let roomNameInput = form.querySelector('input');
const peers = {}
const roomAction = document.querySelector('.room-action');
const muteBtn = roomAction.querySelector(".mute");
const shareRoom = roomAction.querySelector('.share-screen');
const leaveRoom = roomAction.querySelector(".leave-room");
const hideCamera = roomAction.querySelector(".hide-camera");
const roomMain = document.querySelector('.room-main');
const localVideo = document.getElementById("local-video");
let localStream = null;
let screenStream = null;
let roomName = roomNameInput.value;
const displayMediaOptions = {
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
};

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
form.onsubmit = (e) => {
    e.preventDefault();
    roomName = roomNameInput.value;
    socket.emit("join", roomName);
}

socket.on("ready", (otherUsers) => {
    navigator.getUserMedia(
        { video: true, audio: true },
        async stream => {
            if (localVideo) {
                localStream = stream;
                localVideo.srcObject = stream;
                localVideo.onloadedmetadata = () => {
                    localVideo.play();
                }
            }
            isAlreadyCalling[socket.id] = false;
            if (!peers[socket.id]) {
                await addPeer(socket.id);
                roomAction.style.display = "flex";
            }

            // stream.getTracks().forEach(track => peers[socket.id].local.addTrack(track, stream));
            for (const socketId of otherUsers) {
                if (isAlreadyCalling[socketId] === undefined) {
                    isAlreadyCalling[socketId] = false;
                    await addPeer(socketId);
                    socket.emit("done-add", roomName, socket.id, 'call');
                }
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

shareRoom.onclick = async () => {
    screenStream = await startCapture(displayMediaOptions);
    if (screenStream) {

        addPeerStream(socket.id);
        socket.emit("stream-screen", roomName, socket.id);

    }
}

socket.on('start-stream', async (socketId) => {
    isAlreadyStream[socketId] = false;
    await addPeerStream(socketId);
    socket.emit("add-stream-done", roomName, socketId);
})

socket.on("call-stream-now", async (socketId) => {
    await addPeerStream(socketId);
    callStream(socketId);
})

async function startCapture(displayMediaOptions) {
    let captureStream;
    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
        return captureStream;
    }
    return captureStream;
}

socket.on("update-user-list", async ({ users }) => {
    await updateUserList(users);
    socket.emit("done-add", roomName, socket.id, "call");
});

socket.on("done-call-start", (type) => {
    for (let socketId of Object.keys(peers)) {
        switch (type) {
            case 'call':
                if (!isAlreadyCalling[socketId]) {
                    callUser(socketId);
                }
                break;
        }
    }
})

socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
    if (elToRemove) {
        elToRemove.remove();
    }
});

async function updateUserList(socketIds) {
    let count = 0;
    return new Promise(async resolve => {
        for (const socketId of socketIds) {
            if (isAlreadyCalling[socketId] === undefined) {
                isAlreadyCalling[socketId] = false;
                await addPeer(socketId);
                count++;
            }
        }
        if (count == socketIds.length) {
            resolve(peers);
        }
    })
}

async function addPeer(socketId) {
    if (peers[socketId]) {
        return true;
    }
    return new Promise(resolve => {
        peers[socketId] = {};
        peers[socketId].local = new RTCPeerConnection();
        peers[socketId].remote = new RTCPeerConnection();
        peers[socketId].local.onnegotiationneeded = async (e) => {
            peers[socketId].offer = await peers[socketId].local.createOffer(offerOptions);
        };
        peers[socketId].remote.ontrack = (e) => gotRemoteStream(e, socketId);
        peers[socketId].local.onicecandidate = (e) => iceCallbackLocal(e, peers[socketId].remote);
        peers[socketId].remote.onicecandidate = (e) => iceCallbackRemote(e, peers[socketId].local);

        let count = 1;
        for (const track of localStream.getTracks()) {
            count++;
            peers[socketId].local.addTrack(track, localStream)
            if (count == localStream.getTracks().length) {
                resolve(true);
            }
        }
    })
}

// Kiểm tra và chờ nếu ông a stream thì mới tạo kết nối stream 
async function addPeerStream(socketId) {
    return new Promise(resolve => {
        peers[socketId] = {};
        peers[socketId].localScreen = new RTCPeerConnection();
        peers[socketId].remoteScreen = new RTCPeerConnection();
        peers[socketId].localScreen.onnegotiationneeded = async (e) => {
            peers[socketId].offer = await peers[socketId].localScreen.createOffer(offerOptions);
        };
        peers[socketId].remoteScreen.ontrack = (e) => gotRemoteStreamScreen(e, socketId);
        peers[socketId].localScreen.onicecandidate = (e) => iceCallbackLocal(e, peers[socketId].remoteScreen);
        peers[socketId].remoteScreen.onicecandidate = (e) => iceCallbackRemote(e, peers[socketId].localScreen);
        let count = 0;
        let typeStream = screenStream ? screenStream : localStream;
        for (const track of typeStream.getTracks()) {
            count++;
            peers[socketId].localScreen.addTrack(track, typeStream)
            if (count == typeStream.getTracks().length) {
                resolve(true);
            }
        }
    })
}

async function callStream(socketId) {
    // Sau đó mới bắt đầu createOffer
    let offer = await peers[socketId].localScreen.createOffer(offerOptions);
    await peers[socketId].localScreen.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-stream", {
        offer,
        to: socketId
    });
}

socket.on("call-stream", async (data) => {
    await peers[data.socket].remoteScreen.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peers[data.socket].remoteScreen.createAnswer();
    await peers[data.socket].remoteScreen.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("make-stream", {
        answer,
        to: data.socket
    })
})

socket.on("answer-stream", async (data) => {
    await peers[data.socket].localScreen.setRemoteDescription(new RTCSessionDescription(data.answer));
    if (!isAlreadyStream[data.socket]) {
        isAlreadyStream[data.socket] = true;
        callStream(data.socket);
    }
})

async function callUser(socketId) {

    // Sau đó mới bắt đầu createOffer
    let offer = await peers[socketId].local.createOffer(offerOptions);
    await peers[socketId].local.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

// Call made này chính là id của thằng được gọi lúc này và call made thì đã qua socket chạy đến thằng đấy rồi
socket.on("call-made", async data => {
    const { remote } = peers[data.socket]
    await remote.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    let answer = peers[data.socket].answer;
    if (remote.signalingState === 'have-remote-offer' || remote.signalingState === "have-local-pranswer") {
        answer = await remote.createAnswer();
        peers[data.socket].answer = answer;
        await remote.setLocalDescription(new RTCSessionDescription(answer));
    }

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
});

// Trả lời cho thằng hiện tại
socket.on("answer-made", async data => {
    await peers[data.socket].local.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );
    if (!isAlreadyCalling[data.socket]) {
        isAlreadyCalling[data.socket] = true;
        callUser(data.socket);
    }
});


function iceCallbackLocal(event, destRemote) {
    handleCandidate(event.candidate, destRemote, 'pc1: ', 'local');
}

function iceCallbackRemote(event, destLocal) {
    handleCandidate(event.candidate, destLocal, 'pc1: ', 'remote');
}
function handleCandidate(candidate, dest, prefix, type) {
    dest.addIceCandidate(candidate)
        .then(onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);

}

function onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    console.log(`Failed to add ICE candidate: ${error.toString()}`);
}

function gotRemoteStream(e, socketId) {
    if (!peers[socketId].remoteVideo) {
        peers[socketId].remoteVideo = document.createElement('video');
        peers[socketId].remoteVideo.className = "video-peer";
        roomMain.append(peers[socketId].remoteVideo);
    }
    if (peers[socketId].remoteVideo) {
        peers[socketId].remoteVideo.srcObject = e.streams[0];
        peers[socketId].remoteVideo.onloadedmetadata = () => {
            peers[socketId].remoteVideo.play();
        }
    }
}

function gotRemoteStreamScreen(e, socketId) {
    if (!peers[socketId].remoteVideoStream) {
        peers[socketId].remoteVideoStream = document.createElement('video');
        peers[socketId].remoteVideoStream.className = "video-stream";
        roomMain.append(peers[socketId].remoteVideoStream);
    }
    if (peers[socketId].remoteVideoStream) {
        peers[socketId].remoteVideoStream.srcObject = e.streams[0];
        peers[socketId].remoteVideoStream.onloadedmetadata = () => {
            peers[socketId].remoteVideoStream.play();
        }
    }
}