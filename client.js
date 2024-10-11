const socket = io();
let peerConnection;

// Handle start-stream event
socket.on("start-stream", (videoSource) => {
  // Setup WebRTC connection if a video source is available
  if (!peerConnection) {
    startWebRTCConnection();
  }
});

// Handle WebRTC offer
socket.on("offer", (offer) => {
  if (!peerConnection) {
    startWebRTCConnection(); // Ensure peer connection is established
  }
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => peerConnection.createAnswer())
    .then((answer) => {
      peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer); // Send answer back to the server
    });
});

// Handle WebRTC answer
socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle ICE candidates
socket.on("ice-candidate", (candidate) => {
  if (candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

function startWebRTCConnection() {
  peerConnection = new RTCPeerConnection();

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.streams[0];
  };
}
