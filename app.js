const socket = io();

// WebRTC peer connection
const peerConnection = new RTCPeerConnection();

// Get the local video element (host side)
const localVideo = document.getElementById("localVideo");

// Check if this is the host or client
let isHost = localVideo.src ? true : false; // If localVideo has a source, this is the host

if (isHost) {
  // If host, capture video from local video element and send it to peer connection
  localVideo.oncanplay = () => {
    const stream = localVideo.captureStream(); // Capture video stream
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream)); // Add tracks to peer connection

    // Create an offer and send it to the server
    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        socket.emit("offer", peerConnection.localDescription);
      });
  };
}

// Handle incoming offer (for clients)
socket.on("offer", (offer) => {
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => {
      return peerConnection.createAnswer();
    })
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      socket.emit("answer", peerConnection.localDescription);
    });
});

// Handle incoming answer (for host)
socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle ICE candidates (for both host and client)
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", event.candidate);
  }
};

// Receive remote stream (for clients)
peerConnection.ontrack = (event) => {
  const remoteVideo = document.createElement("video");
  remoteVideo.srcObject = event.streams[0];
  remoteVideo.autoplay = true;
  document.body.appendChild(remoteVideo);
};

// Handle incoming ICE candidates
socket.on("ice-candidate", (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
