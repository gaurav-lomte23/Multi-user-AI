import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let users = {}; // { socketId: { name, color } }
let chatHistory = []; // store messages

function getRandomColor() {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FFC300", "#8E44AD"];
  return colors[Math.floor(Math.random() * colors.length)];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user
  socket.on("join", (name) => {
    users[socket.id] = { name, color: getRandomColor() };
    io.emit("userList", Object.values(users));

    // Send chat history to this user
    socket.emit("chatHistory", chatHistory);
  });

  // Receive chat message
  socket.on("chatMessage", ({ user, text }) => {
    const color = users[socket.id]?.color || "black";
    const msg = { user, text, color };
    chatHistory.push(msg);
    io.emit("chatMessage", msg);

    // Dummy AI reply after 1s
    setTimeout(() => {
      const aiMsg = {
        user: "AI",
        text: `AI: Hey ${user}, I received your message "${text}"`,
        color: "#3498db",
      };
      chatHistory.push(aiMsg);
      io.emit("chatMessage", aiMsg);
    }, 1000);
  });

  // Typing indicator
  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", Object.values(users));
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
