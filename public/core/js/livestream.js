var V=Object.defineProperty;var C=(r,e,t)=>e in r?V(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var s=(r,e,t)=>(C(r,typeof e!="symbol"?e+"":e,t),t);import{s as o}from"./socket.js";class O{constructor(e={},t={}){s(this,"setScreenStream",e=>{this.localStreamScreen=e});s(this,"setLocalStream",e=>{this.localStream=e});s(this,"getUserMedia",async()=>{try{return await navigator.mediaDevices.getUserMedia(this.options.userMediaOptions)}catch{return!1}});s(this,"startCapture",async()=>{let e;try{e=await navigator.mediaDevices.getDisplayMedia(this.options.displayMediaOptions)}catch{return e}return e});s(this,"addPeer",async e=>this.peers[e]?!0:new Promise(t=>{this.peers[e]||(this.peers[e]={}),this.peers[e].isAlreadyCalling=!1,this.peers[e].local=new RTCPeerConnection,this.peers[e].remote=new RTCPeerConnection,this.peers[e].local.onnegotiationneeded=async n=>{this.peers[e].offer=await this.peers[e].local.createOffer(this.options.offerOptions)},this.peers[e].remote.ontrack=n=>this.gotRemoteStream(n,e),this.peers[e].local.onicecandidate=n=>this.iceCallbackLocal(n,this.peers[e].remote),this.peers[e].remote.onicecandidate=n=>this.iceCallbackRemote(n,this.peers[e].local);let i=1;for(const n of this.localStream.getTracks())i++,this.peers[e].local.addTrack(n,this.localStream),i==this.localStream.getTracks().length&&t(!0)}));s(this,"addPeerStream",async e=>new Promise(t=>{this.peers[e]||(this.peers[e]={}),this.peers[e].isAlreadyStream=!1,this.peers[e].localScreen=new RTCPeerConnection,this.peers[e].remoteScreen=new RTCPeerConnection,this.peers[e].remoteScreen.ontrack=p=>this.gotRemoteStreamScreen(p,e),this.peers[e].localScreen.onicecandidate=p=>this.iceCallbackLocal(p,this.peers[e].remoteScreen),this.peers[e].remoteScreen.onicecandidate=p=>this.iceCallbackRemote(p,this.peers[e].localScreen);let i=0,n=this.localStreamScreen?this.localStreamScreen:this.localStream;for(const p of n.getTracks())i++,this.peers[e].localScreen.addTrack(p,n),i==n.getTracks().length&&t(!0)}));s(this,"iceCallbackLocal",(e,t)=>{this.handleCandidate(e.candidate,t,"pc1: ","local")});s(this,"iceCallbackRemote",(e,t)=>{this.handleCandidate(e.candidate,t,"pc1: ","remote")});s(this,"handleCandidate",(e,t,i,n)=>{t.addIceCandidate(e).then(this.onAddIceCandidateSuccess,this.onAddIceCandidateError)});s(this,"onAddIceCandidateSuccess",()=>{});s(this,"onAddIceCandidateError",e=>{});s(this,"gotRemoteStream",(e,t)=>{this.peers[t].remoteVideo||(this.peers[t].remoteVideo=document.createElement("video"),this.peers[t].remoteVideo.className="video-peer",this.elementRoot.append(this.peers[t].remoteVideo)),this.peers[t].remoteVideo&&(this.peers[t].remoteVideo.srcObject=e.streams[0],this.peers[t].remoteVideo.onloadedmetadata=()=>{this.peers[t].remoteVideo.play()})});s(this,"gotRemoteStreamScreen",(e,t)=>{this.peers[t].remoteVideoStream||(this.peers[t].remoteVideoStream=document.createElement("video"),this.peers[t].remoteVideoStream.className="video-stream",this.elementVideoRoot.append(this.peers[t].remoteVideoStream)),this.peers[t].remoteVideoStream&&(this.peers[t].remoteVideoStream.srcObject=e.streams[0],this.peers[t].remoteVideoStream.onloadedmetadata=()=>{this.peers[t].remoteVideoStream.play()})});s(this,"remotePeerLocal",e=>{if(this.peers[e]&&this.peers[e].remoteVideo&&this.peers[e].remoteVideo.srcObject&&this.peers[e].remoteVideo.srcObject.getTracks()){for(const t of this.peers[e].remoteVideo.srcObject.getTracks())t.stop();this.peers[e].remoteVideo.srcObject=null,this.peers[e].remoteVideo.remove()}});s(this,"removePeerRemote",e=>{if(this.peers[e]&&this.peers[e].remoteVideo&&this.peers[e].remoteVideo.srcObject){for(const t of this.peers[e].remoteVideo.srcObject.getTracks())t.stop();this.peers[e].remoteVideo.srcObject=null,this.peers[e].remoteVideo.remove()}});s(this,"removePeerRemoteStream",e=>{if(this.peers[e]&&this.peers[e].remoteVideoStream&&this.peers[e].remoteVideoStream.srcObject){for(const t of this.peers[e].remoteVideoStream.srcObject.getTracks())t.stop();this.peers[e].remoteVideoStream.srcObject=null,this.peers[e].remoteVideoStream.remove(),delete this.peers[e].remoteVideoStream}});this.localStream=null,this.localStreamScreen=null,this.options=Object.assign({},t),this.elementRoot=e.rootEl,this.elementVideoRoot=e.rootScreenEl,this.peers={}}}navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;const{RTCSessionDescription:m}=window;o.connect();const u=document.querySelector("form.room");let w=u.querySelector("input");const d=document.querySelector(".room-action"),f=d.querySelector(".mute"),h=d.querySelector(".share-screen"),T=d.querySelector(".leave-room"),S=d.querySelector(".hide-camera"),y=document.querySelector(".room-main"),R=document.querySelector(".room-screen"),c=document.getElementById("local-video");let l=w.value;const a=new O({rootEl:y,rootScreenEl:R},{userMediaOptions:{audio:!0,video:!0},offerOptions:{offerToReceiveAudio:1,offerToReceiveVideo:1},displayMediaOptions:{video:{displaySurface:"browser"},audio:{suppressLocalAudioPlayback:!1},preferCurrentTab:!1,selfBrowserSurface:"exclude",systemAudio:"include",surfaceSwitching:"include",monitorTypeSurfaces:"include"}});u.onsubmit=r=>{r.preventDefault(),l=w.value,o.emit("join",l)};o.on("ready",async(r,e)=>{const t=await a.getUserMedia();if(!t)return alert("Không hỗ trợ!"),!1;a.setLocalStream(t),c&&(c.srcObject=t,c.onloadedmetadata=()=>{c.play()}),a.peers[o.id]&&(a.peers[o.id].isAlreadyCalling=!1),a.peers[o.id]||(await a.addPeer(o.id),g(!0));for(const i of r)a.peers[i]||(await a.addPeer(i),o.emit("done-add",l,o.id,"call"));for(const i of e)await a.addPeerStream(i),o.emit("add-stream-done",l,i)});function g(r=!0){u.style.display=r?"none":null,y.style.display=r?"flex":null,d.style.display=r?"flex":null}o.on("update-user-list",async({users:r})=>{let e=0;await new Promise(async t=>{for(const i of r)a.peers[i]||(await a.addPeer(i),e++);e==r.length&&t(a.peers)}),o.emit("done-add",l,o.id,"call")});o.on("start-stream",async r=>{a.peers[r]&&(a.peers[r].isAlreadyStream=!1),await a.addPeerStream(r),o.emit("add-stream-done",l,r)});o.on("call-stream-now",async r=>{a.peers[r]&&(a.peers[r].isAlreadyStream=!1),await a.addPeerStream(r),b(r)});o.on("done-call-start",r=>{for(let e of Object.keys(a.peers))switch(r){case"call":a.peers[e].isAlreadyCalling||v(e);break}});async function b(r){let e=await a.peers[r].localScreen.createOffer(a.options.offerOptions);await a.peers[r].localScreen.setLocalDescription(new m(e)),o.emit("call-stream",{offer:e,to:r})}o.on("call-stream",async r=>{await a.peers[r.socket].remoteScreen.setRemoteDescription(new m(r.offer));const e=await a.peers[r.socket].remoteScreen.createAnswer();await a.peers[r.socket].remoteScreen.setLocalDescription(new m(e)),o.emit("make-stream",{answer:e,to:r.socket})});o.on("answer-stream",async r=>{await a.peers[r.socket].localScreen.setRemoteDescription(new m(r.answer)),a.peers[r.socket].isAlreadyStream||(a.peers[r.socket].isAlreadyStream=!0,b(r.socket))});async function v(r){let e=await a.peers[r].local.createOffer(a.options.offerOptions);await a.peers[r].local.setLocalDescription(new m(e)),o.emit("call-user",{offer:e,to:r})}o.on("call-made",async r=>{const{remote:e}=a.peers[r.socket];await e.setRemoteDescription(new m(r.offer));let t=a.peers[r.socket].answer;(e.signalingState==="have-remote-offer"||e.signalingState==="have-local-pranswer")&&(t=await e.createAnswer(),a.peers[r.socket].answer=t,await e.setLocalDescription(new m(t))),o.emit("make-answer",{answer:t,to:r.socket})});o.on("answer-made",async r=>{await a.peers[r.socket].local.setRemoteDescription(new m(r.answer)),a.peers[r.socket].isAlreadyCalling||(a.peers[r.socket].isAlreadyCalling=!0,v(r.socket))});o.on("leave-room-now",r=>{if(a.remotePeerLocal(r),a.removePeerRemoteStream(r),delete a.peers[r],r===o.id){if(c.srcObject&&c.srcObject.getTracks()){for(const e of c.srcObject.getTracks())e.stop();c.srcObject=null}for(const e of Object.keys(a.peers))a.removePeerRemote(e),a.removePeerRemoteStream(e),delete a.peers[e];o.emit("check-room-after-leave",l,r),g(!1)}});o.on("stop-share-screen-now",r=>{a.removePeerRemoteStream(r)});f.onclick=()=>{if(f.innerText==="Mute"){for(const r of c.srcObject.getTracks())r.kind==="audio"&&(r.enabled=!1);f.innerText="Un mute"}else{for(const r of c.srcObject.getTracks())r.kind==="audio"&&(r.enabled=!0);f.innerText="Mute"}};S.onclick=()=>{if(S.innerText==="Hide Camera"){for(const r of c.srcObject.getTracks())r.kind==="video"&&(r.enabled=!1);S.innerText="Show Camera"}else{for(const r of c.srcObject.getTracks())r.kind==="video"&&(r.enabled=!0);S.innerText="Hide Camera"}};h.onclick=async()=>{if(h.innerText==="Share screen"){let r=await a.startCapture();a.setScreenStream(r),a.addPeerStream(o.id),o.emit("stream-screen",l,o.id),h.innerText="Stop share screen"}else o.emit("stop-share-screen",l),h.innerText="Share screen"};T.onclick=async()=>{o.emit("leave-room",l)};
