const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (html, video, js)
app.use(express.static(__dirname));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// WebRTC signaling (using socket.io)
io.on("connection", (socket) => {
  console.log("A user connected");

  // Forward offer to clients
  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  // Forward answer to host
  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  // Forward ICE candidates between peers
  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
