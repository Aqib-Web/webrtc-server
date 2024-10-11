const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const socket = io();
let peerConnection;
let localStream;

document.getElementById("startStreamButton").addEventListener("click", () => {
  const videoSource = document.getElementById("videoSource").value;
  socket.emit("start-stream", videoSource);

  // Initialize WebRTC connection
  startWebRTCConnection(videoSource);
});

document.getElementById("stopStreamButton").addEventListener("click", () => {
  socket.emit("stop-stream");
  peerConnection.close();
});

function startWebRTCConnection(videoSource) {
  peerConnection = new RTCPeerConnection();

  // Get video stream and add to peer connection
  const localVideo = document.getElementById("localVideo");
  localStream = localVideo.srcObject;
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  // Create offer and send to clients
  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer); // Send offer to clients
  });

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };
}
