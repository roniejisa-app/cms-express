var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { s as socket } from "./socket.js";
class PeerRS {
  constructor(el = {}, options = {}) {
    __publicField(this, "setScreenStream", (screenStream) => {
      this.localStreamScreen = screenStream;
    });
    __publicField(this, "setLocalStream", (localStream) => {
      this.localStream = localStream;
    });
    __publicField(this, "getUserMedia", async () => {
      try {
        return await navigator.mediaDevices.getUserMedia(this.options.userMediaOptions);
      } catch (e) {
        return false;
      }
    });
    __publicField(this, "startCapture", async () => {
      let captureStream;
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(this.options.displayMediaOptions);
      } catch (err) {
        return captureStream;
      }
      return captureStream;
    });
    __publicField(this, "addPeer", async (socketId) => {
      if (this.peers[socketId]) {
        return true;
      }
      return new Promise((resolve) => {
        if (!this.peers[socketId]) {
          this.peers[socketId] = {};
        }
        this.peers[socketId].isAlreadyCalling = false;
        this.peers[socketId].local = new RTCPeerConnection();
        this.peers[socketId].remote = new RTCPeerConnection();
        this.peers[socketId].local.onnegotiationneeded = async (e) => {
          this.peers[socketId].offer = await this.peers[socketId].local.createOffer(this.options.offerOptions);
        };
        this.peers[socketId].remote.ontrack = (e) => this.gotRemoteStream(e, socketId);
        this.peers[socketId].local.onicecandidate = (e) => this.iceCallbackLocal(e, this.peers[socketId].remote);
        this.peers[socketId].remote.onicecandidate = (e) => this.iceCallbackRemote(e, this.peers[socketId].local);
        let count = 1;
        for (const track of this.localStream.getTracks()) {
          count++;
          this.peers[socketId].local.addTrack(track, this.localStream);
          if (count == this.localStream.getTracks().length) {
            resolve(true);
          }
        }
      });
    });
    __publicField(this, "addPeerStream", async (socketId) => {
      return new Promise((resolve) => {
        if (!this.peers[socketId]) {
          this.peers[socketId] = {};
        }
        this.peers[socketId].isAlreadyStream = false;
        this.peers[socketId].localScreen = new RTCPeerConnection();
        this.peers[socketId].remoteScreen = new RTCPeerConnection();
        this.peers[socketId].remoteScreen.ontrack = (e) => this.gotRemoteStreamScreen(e, socketId);
        this.peers[socketId].localScreen.onicecandidate = (e) => this.iceCallbackLocal(e, this.peers[socketId].remoteScreen);
        this.peers[socketId].remoteScreen.onicecandidate = (e) => this.iceCallbackRemote(e, this.peers[socketId].localScreen);
        let count = 0;
        let typeStream = this.localStreamScreen ? this.localStreamScreen : this.localStream;
        for (const track of typeStream.getTracks()) {
          count++;
          this.peers[socketId].localScreen.addTrack(track, typeStream);
          if (count == typeStream.getTracks().length) {
            resolve(true);
          }
        }
      });
    });
    __publicField(this, "iceCallbackLocal", (event, destRemote) => {
      this.handleCandidate(event.candidate, destRemote, "pc1: ", "local");
    });
    __publicField(this, "iceCallbackRemote", (event, destLocal) => {
      this.handleCandidate(event.candidate, destLocal, "pc1: ", "remote");
    });
    __publicField(this, "handleCandidate", (candidate, dest, prefix, type) => {
      dest.addIceCandidate(candidate).then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError);
      console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : "(null)"}`);
    });
    __publicField(this, "onAddIceCandidateSuccess", () => {
      console.log("AddIceCandidate success.");
    });
    __publicField(this, "onAddIceCandidateError", (error) => {
      console.log(`Failed to add ICE candidate: ${error.toString()}`);
    });
    __publicField(this, "gotRemoteStream", (e, socketId) => {
      if (!this.peers[socketId].remoteVideo) {
        this.peers[socketId].remoteVideo = document.createElement("video");
        this.peers[socketId].remoteVideo.className = "video-peer";
        this.elementRoot.append(this.peers[socketId].remoteVideo);
      }
      if (this.peers[socketId].remoteVideo) {
        this.peers[socketId].remoteVideo.srcObject = e.streams[0];
        this.peers[socketId].remoteVideo.onloadedmetadata = () => {
          this.peers[socketId].remoteVideo.play();
        };
      }
    });
    __publicField(this, "gotRemoteStreamScreen", (e, socketId) => {
      if (!this.peers[socketId].remoteVideoStream) {
        this.peers[socketId].remoteVideoStream = document.createElement("video");
        this.peers[socketId].remoteVideoStream.className = "video-stream";
        this.elementVideoRoot.append(this.peers[socketId].remoteVideoStream);
      }
      if (this.peers[socketId].remoteVideoStream) {
        this.peers[socketId].remoteVideoStream.srcObject = e.streams[0];
        this.peers[socketId].remoteVideoStream.onloadedmetadata = () => {
          this.peers[socketId].remoteVideoStream.play();
        };
      }
    });
    __publicField(this, "remotePeerLocal", (socketId) => {
      if (this.peers[socketId] && this.peers[socketId].remoteVideo && this.peers[socketId].remoteVideo.srcObject && this.peers[socketId].remoteVideo.srcObject.getTracks()) {
        for (const track of this.peers[socketId].remoteVideo.srcObject.getTracks()) {
          track.stop();
        }
        this.peers[socketId].remoteVideo.srcObject = null;
        this.peers[socketId].remoteVideo.remove();
      }
    });
    __publicField(this, "removePeerRemote", (socketId) => {
      if (this.peers[socketId] && this.peers[socketId].remoteVideo && this.peers[socketId].remoteVideo.srcObject) {
        for (const track of this.peers[socketId].remoteVideo.srcObject.getTracks()) {
          track.stop();
        }
        this.peers[socketId].remoteVideo.srcObject = null;
        this.peers[socketId].remoteVideo.remove();
      }
    });
    __publicField(this, "remotePeerRemoteStream", (socketId) => {
      if (this.peers[socketId] && this.peers[socketId].remoteVideoStream && this.peers[socketId].remoteVideoStream.srcObject) {
        for (const track of this.peers[socketId].remoteVideoStream.srcObject.getTracks()) {
          track.stop();
        }
        this.peers[socketId].remoteVideoStream.srcObject = null;
        this.peers[socketId].remoteVideoStream.remove();
      }
    });
    this.localStream = null;
    this.localStreamScreen = null;
    this.options = Object.assign({}, options);
    this.elementRoot = el.rootEl;
    this.elementVideoRoot = el.rootScreenEl;
    this.peers = {};
  }
}
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
const { RTCSessionDescription } = window;
socket.connect();
const form = document.querySelector("form.room");
let roomNameInput = form.querySelector("input");
const roomAction = document.querySelector(".room-action");
const muteBtn = roomAction.querySelector(".mute");
const shareRoom = roomAction.querySelector(".share-screen");
const leaveRoom = roomAction.querySelector(".leave-room");
const hideCamera = roomAction.querySelector(".hide-camera");
const roomMain = document.querySelector(".room-main");
const roomScreenMain = document.querySelector(".room-screen");
const localVideo = document.getElementById("local-video");
let roomName = roomNameInput.value;
const peerRS = new PeerRS(
  {
    rootEl: roomMain,
    rootScreenEl: roomScreenMain
  },
  {
    userMediaOptions: {
      audio: true,
      video: true
    },
    offerOptions: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    },
    displayMediaOptions: {
      video: {
        displaySurface: "browser"
      },
      audio: {
        suppressLocalAudioPlayback: false
      },
      preferCurrentTab: false,
      selfBrowserSurface: "exclude",
      systemAudio: "include",
      surfaceSwitching: "include",
      monitorTypeSurfaces: "include"
    }
  }
);
form.onsubmit = (e) => {
  e.preventDefault();
  roomName = roomNameInput.value;
  socket.emit("join", roomName);
};
socket.on("ready", async (otherUsers, userStream) => {
  const stream = await peerRS.getUserMedia();
  if (!stream) {
    alert("Không hỗ trợ!");
    return false;
  }
  peerRS.setLocalStream(stream);
  if (localVideo) {
    localVideo.srcObject = stream;
    localVideo.onloadedmetadata = () => {
      localVideo.play();
    };
  }
  if (peerRS.peers[socket.id]) {
    peerRS.peers[socket.id].isAlreadyCalling = false;
  }
  if (!peerRS.peers[socket.id]) {
    await peerRS.addPeer(socket.id);
    showForm(true);
  }
  for (const socketId of otherUsers) {
    if (!peerRS.peers[socketId]) {
      await peerRS.addPeer(socketId);
      socket.emit("done-add", roomName, socket.id, "call");
    }
  }
  for (const socketId of userStream) {
    await peerRS.addPeerStream(socketId);
    socket.emit("add-stream-done", roomName, socketId);
  }
});
function showForm(isShow = true) {
  form.style.display = isShow ? "none" : null;
  roomMain.style.display = isShow ? "flex" : null;
  roomAction.style.display = isShow ? "flex" : null;
}
socket.on("update-user-list", async ({ users }) => {
  let count = 0;
  await new Promise(async (resolve) => {
    for (const socketId of users) {
      if (!peerRS.peers[socketId]) {
        await peerRS.addPeer(socketId);
        count++;
      }
    }
    if (count == users.length) {
      resolve(peerRS.peers);
    }
  });
  socket.emit("done-add", roomName, socket.id, "call");
});
socket.on("start-stream", async (socketId) => {
  await peerRS.addPeerStream(socketId);
  socket.emit("add-stream-done", roomName, socketId);
});
socket.on("call-stream-now", async (socketId) => {
  await peerRS.addPeerStream(socketId);
  callStream(socketId);
});
socket.on("done-call-start", (type) => {
  for (let socketId of Object.keys(peerRS.peers)) {
    switch (type) {
      case "call":
        if (!peerRS.peers[socketId].isAlreadyCalling) {
          callUser(socketId);
        }
        break;
    }
  }
});
async function callStream(socketId) {
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
  });
});
socket.on("answer-stream", async (data) => {
  await peerRS.peers[data.socket].localScreen.setRemoteDescription(new RTCSessionDescription(data.answer));
  if (!peerRS.peers[data.socket].isAlreadyStream) {
    peerRS.peers[data.socket].isAlreadyStream = true;
    callStream(data.socket);
  }
});
async function callUser(socketId) {
  let offer = await peerRS.peers[socketId].local.createOffer(peerRS.options.offerOptions);
  await peerRS.peers[socketId].local.setLocalDescription(new RTCSessionDescription(offer));
  socket.emit("call-user", {
    offer,
    to: socketId
  });
}
socket.on("call-made", async (data) => {
  const { remote } = peerRS.peers[data.socket];
  await remote.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  let answer = peerRS.peers[data.socket].answer;
  if (remote.signalingState === "have-remote-offer" || remote.signalingState === "have-local-pranswer") {
    answer = await remote.createAnswer();
    peerRS.peers[data.socket].answer = answer;
    await remote.setLocalDescription(new RTCSessionDescription(answer));
  }
  socket.emit("make-answer", {
    answer,
    to: data.socket
  });
});
socket.on("answer-made", async (data) => {
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
});
muteBtn.onclick = () => {
  if (muteBtn.innerText === "Mute") {
    for (const track of localVideo.srcObject.getTracks()) {
      if (track.kind === "audio") {
        track.enabled = false;
      }
    }
    muteBtn.innerText = "Un mute";
  } else {
    for (const track of localVideo.srcObject.getTracks()) {
      if (track.kind === "audio") {
        track.enabled = true;
      }
    }
    muteBtn.innerText = "Mute";
  }
};
hideCamera.onclick = () => {
  if (hideCamera.innerText === "Hide Camera") {
    for (const track of localVideo.srcObject.getTracks()) {
      if (track.kind === "video") {
        track.enabled = false;
      }
    }
    hideCamera.innerText = "Show Camera";
  } else {
    for (const track of localVideo.srcObject.getTracks()) {
      if (track.kind === "video") {
        track.enabled = true;
      }
    }
    hideCamera.innerText = "Hide Camera";
  }
};
shareRoom.onclick = async () => {
  let screenStream = await peerRS.startCapture();
  peerRS.setScreenStream(screenStream);
  peerRS.addPeerStream(socket.id);
  socket.emit("stream-screen", roomName, socket.id);
};
leaveRoom.onclick = async () => {
  socket.emit("leave-room", roomName);
};
