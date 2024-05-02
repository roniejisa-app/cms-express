export class PeerRS {
    constructor(el = {}, options = {}) {
        this.localStream = null;
        this.localStreamScreen = null;
        this.options = Object.assign({}, options);
        this.elementRoot = el.rootEl;
        this.elementVideoRoot = el.rootScreenEl;
        this.peers = {};
    }
    setScreenStream = (screenStream) => {
        this.localStreamScreen = screenStream;
    }
    setLocalStream = (localStream) => {
        this.localStream = localStream;
    }

    getUserMedia = async () => {
        try {
            return await navigator.mediaDevices.getUserMedia(this.options.userMediaOptions);
        } catch (e) {
            return false;
        }
    }

    startCapture = async () => {
        let captureStream;
        try {
            captureStream = await navigator.mediaDevices.getDisplayMedia(this.options.displayMediaOptions);
        } catch (err) {
            return captureStream;
        }
        return captureStream;
    }
    
    addPeer = async (socketId) => {
        if (this.peers[socketId]) {
            return true;
        }
        return new Promise(resolve => {
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
                this.peers[socketId].local.addTrack(track, this.localStream)
                if (count == this.localStream.getTracks().length) {
                    resolve(true);
                }
            }
        })
    }

    addPeerStream = async (socketId) => {
        return new Promise(resolve => {
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
                this.peers[socketId].localScreen.addTrack(track, typeStream)
                if (count == typeStream.getTracks().length) {
                    resolve(true);
                }
            }
        })
    }

    iceCallbackLocal = (event, destRemote) => {
        this.handleCandidate(event.candidate, destRemote, 'pc1: ', 'local');
    }

    iceCallbackRemote = (event, destLocal) => {
        this.handleCandidate(event.candidate, destLocal, 'pc1: ', 'remote');
    }

    handleCandidate = (candidate, dest, prefix, type) => {
        dest.addIceCandidate(candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError);
        console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
    }

    onAddIceCandidateSuccess = () => {
        console.log('AddIceCandidate success.');
    }

    onAddIceCandidateError = (error) => {
        console.log(`Failed to add ICE candidate: ${error.toString()}`);
    }

    gotRemoteStream = (e, socketId) => {
        if (!this.peers[socketId].remoteVideo) {
            this.peers[socketId].remoteVideo = document.createElement('video');
            this.peers[socketId].remoteVideo.className = "video-peer";
            this.elementRoot.append(this.peers[socketId].remoteVideo);
        }
        if (this.peers[socketId].remoteVideo) {
            this.peers[socketId].remoteVideo.srcObject = e.streams[0];
            this.peers[socketId].remoteVideo.onloadedmetadata = () => {
                this.peers[socketId].remoteVideo.play();
            }
        }
    }

    gotRemoteStreamScreen = (e, socketId) => {
        if (!this.peers[socketId].remoteVideoStream) {
            this.peers[socketId].remoteVideoStream = document.createElement('video');
            this.peers[socketId].remoteVideoStream.className = "video-stream";
            this.elementVideoRoot.append(this.peers[socketId].remoteVideoStream);
        }
        if (this.peers[socketId].remoteVideoStream) {
            this.peers[socketId].remoteVideoStream.srcObject = e.streams[0];
            this.peers[socketId].remoteVideoStream.onloadedmetadata = () => {
                this.peers[socketId].remoteVideoStream.play();
            }
        }
    }

    remotePeerLocal = (socketId) => {
        if (this.peers[socketId] && this.peers[socketId].remoteVideo && this.peers[socketId].remoteVideo.srcObject && this.peers[socketId].remoteVideo.srcObject.getTracks()) {
            for (const track of this.peers[socketId].remoteVideo.srcObject.getTracks()) {
                track.stop();
            }
            this.peers[socketId].remoteVideo.srcObject = null;
            this.peers[socketId].remoteVideo.remove();
        }
    }

    removePeerRemote = (socketId) => {
        if (this.peers[socketId] && this.peers[socketId].remoteVideo && this.peers[socketId].remoteVideo.srcObject) {
            for (const track of this.peers[socketId].remoteVideo.srcObject.getTracks()) {
                track.stop();
            }
            this.peers[socketId].remoteVideo.srcObject = null;
            this.peers[socketId].remoteVideo.remove();
        }
    }

    remotePeerRemoteStream = (socketId) => {
        if (this.peers[socketId] && this.peers[socketId].remoteVideoStream && this.peers[socketId].remoteVideoStream.srcObject) {
            for (const track of this.peers[socketId].remoteVideoStream.srcObject.getTracks()) {
                track.stop();
            }
            this.peers[socketId].remoteVideoStream.srcObject = null;
            this.peers[socketId].remoteVideoStream.remove();
        }
    }
}

export default {};