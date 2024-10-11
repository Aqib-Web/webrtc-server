const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files for admin and client UIs
app.use(express.static(__dirname));

// Serve admin UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve client UI
app.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "client.html"));
});

// Handle socket communication
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle admin starting the stream
  socket.on("start-stream", (videoSource) => {
    // Broadcast to all clients that the stream has started
    io.emit("start-stream", videoSource);
  });

  // Handle admin stopping the stream
  socket.on("stop-stream", () => {
    io.emit("stream-stopped");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
