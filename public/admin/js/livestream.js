import { s as socket } from "./socket.js";
const { RTCPeerConnection, RTCSessionDescription } = window;
new RTCPeerConnection();
new RTCPeerConnection();
let isAlreadyCalling = false;
let isAlreadyShare = false;
let peers = {
  cams: {},
  screens: {}
};
socket.on("connect", async () => {
});
socket.on("update-user-list", ({ users }) => {
  updateUserList(users);
  for (const socketId of users) {
    peers.cams[socketId] = new RTCPeerConnection();
    peers.screens[socketId] = new RTCPeerConnection();
  }
  addEventListenerPeerOnTrack();
});
socket.on("remove-user", ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);
  if (elToRemove) {
    elToRemove.remove();
  }
});
function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById("active-user-container");
  socketIds.forEach((socketId) => {
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
    for (let socketId2 of Object.keys(peers.cams)) {
      callUser(socketId2);
    }
    const buttonShareScreen = talkingWithInfo.querySelector(".share-screen");
    addEventShareAll(buttonShareScreen);
  });
  return userContainerEl;
}
async function callUser(socketId) {
  const offer = await peers.cams[socketId].createOffer();
  await peers.cams[socketId].setLocalDescription(new RTCSessionDescription(offer));
  socket.emit("call-user", {
    offer,
    to: socketId,
    from: socket.id
  });
}
socket.on("call-made", async (data) => {
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
socket.on("answer-made", async (data) => {
  await peers.cams[data.socket].setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
  if (!isAlreadyCalling) {
    for (let socketId of Object.keys(peers.cams)) {
      callUser(socketId);
    }
    isAlreadyCalling = true;
  }
});
document.getElementById("videoCall");
const remoteVideo = document.getElementById("remote-video");
const constraints = {
  audio: true,
  video: { width: 300, height: 200 }
};
function addEventListenerPeerOnTrack() {
  navigator.mediaDevices.getUserMedia(constraints).then(
    (mediaStream) => {
      for (const socketId of Object.keys(peers.cams)) {
        mediaStream.getTracks().forEach((track) => peers.cams[socketId].addTrack(track, mediaStream));
      }
    },
    (error) => {
      console.warn(error.message);
    }
  );
  for (const socketId of Object.keys(peers.cams)) {
    peers.cams[socketId].ontrack = function({ streams: [stream] }) {
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.onloadeddata = () => {
          remoteVideo.play();
        };
      }
    };
  }
  for (const socketId of Object.keys(peers.screens)) {
    peers.screens[socketId].ontrack = function({ streams: [stream] }) {
      if (screeShare) {
        screeShare.srcObject = stream;
        screeShare.onloadeddata = () => {
          screeShare.play();
        };
      }
    };
  }
}
let screeShare = document.getElementById("screenShare");
socket.on("share-screen-made", async (data) => {
  await peers.screens[data.socket].setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peers.screens[data.socket].createAnswer();
  await peers.screens[data.socket].setLocalDescription(new RTCSessionDescription(answer));
  console.log(data);
  socket.emit("make-screen-answer", {
    answer,
    to: data.socket
  });
});
socket.on("answer-share-screen-made", async (data) => {
  await peers.screens[data.socket].setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
  if (!isAlreadyShare) {
    for (const socketId of Object.keys(peers.screens)) {
      shareScreen(socketId);
    }
    isAlreadyShare = true;
  }
});
function addEventShareAll(buttonShareScreen) {
  buttonShareScreen.onclick = async () => {
    if (isAlreadyShare) {
      stopShare();
    } else {
      try {
        const mediaStream = await startCapture(displayMediaOptions);
        for (const socketId of Object.keys(peers.screens)) {
          mediaStream.getTracks().forEach((track) => peers.screens[socketId].addTrack(track, mediaStream));
          shareScreen(socketId);
        }
      } catch (e) {
        console.log("Hủy không share nữa");
      }
    }
  };
}
const displayMediaOptions = {
  video: {
    displaySurface: "monitor"
  },
  audio: {
    suppressLocalAudioPlayback: true
  },
  preferCurrentTab: false,
  selfBrowserSurface: "exclude",
  systemAudio: "include",
  surfaceSwitching: "include",
  monitorTypeSurfaces: "include"
};
async function startCapture(displayMediaOptions2) {
  let captureStream;
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions2);
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
  });
}
socket.connect();
