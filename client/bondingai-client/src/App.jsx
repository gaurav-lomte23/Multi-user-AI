import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("userList", (list) => setUsers(list));
    socket.on("chatHistory", (history) => setMessages(history));

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on("typing", (typingName) => {
      setTyping(`${typingName} is typing...`);
      setTimeout(() => setTyping(""), 1500);
    });

    return () => {
      socket.off("userList");
      socket.off("chatMessage");
      socket.off("chatHistory");
      socket.off("typing");
    };
  }, []);

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleLogin = () => {
    if (name.trim()) {
      socket.emit("join", name);
      setLoggedIn(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      socket.emit("chatMessage", { user: name, text: message });
      setMessage("");
    }
  };

  const handleTyping = () => socket.emit("typing", name);

  // Login Screen
  if (!loggedIn)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="backdrop-blur-lg bg-white/20 p-10 rounded-2xl shadow-2xl w-96 text-center border border-white/30">
          <h2 className="text-3xl mb-6 font-extrabold text-white drop-shadow-lg">
            🚀 Welcome to Bonding AI
          </h2>
          <input
            className="border-2 border-white/40 bg-white/10 text-white p-3 rounded-lg w-full mb-4 placeholder-white/70 focus:ring-2 focus:ring-pink-300 outline-none"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition transform"
            onClick={handleLogin}
          >
            Join Chat 🎉
          </button>
        </div>
      </div>
    );

  // Chat UI
  return (
    <div className="flex h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Sidebar */}
      <div className="w-1/4 backdrop-blur-lg bg-white/10 p-6 border-r border-white/20 shadow-xl">
        <h2 className="text-lg font-bold mb-6 text-white">👥 Active Users</h2>
        <ul className="space-y-4">
          {users.map((u, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: u.color }}
              ></div>
              <span
                className="font-semibold"
                style={{ color: u.color || "#fff" }}
              >
                {u.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => {
            const isOwn = msg.user === name;
            const isAI = msg.user === "AI";

            return (
              <div
                key={i}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-xs shadow-lg text-sm ${
                    isAI
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                      : isOwn
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                   <span
          className="font-extrabold text-sm mb-2 block tracking-wide drop-shadow-md"
          style={{
            color: isAI ? "#f08e8eff" : msg.color || "#ffeb3b", // fallback yellow if no color
            textShadow: "0 0 8px rgba(255,255,255,0.6)",
          }}
        >
           {/* Highlighted Username */}
        <span
          className="font-extrabold text-sm mb-2 block tracking-wide drop-shadow-md"
          style={{
            color: "#6db976ff", // always white text inside bubble
            textShadow: "0 0 8px rgba(0,0,0,0.6)",
          }}
        ></span>
                    {msg.user}
                  </span>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Typing Indicator */}
        {typing && (
          <div className="px-6 pb-2 text-sm text-pink-200 italic">{typing}</div>
        )}

        {/* Input */}
        <div className="flex border-t border-white/20 bg-white/10 p-4 backdrop-blur-lg">
          <input
            className="flex-1 border-2 border-white/30 bg-white/20 text-white p-3 rounded-lg placeholder-white/60 focus:ring-2 focus:ring-cyan-400 outline-none"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            onKeyUp={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="ml-3 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-bold hover:scale-105 transition transform"
            onClick={handleSend}
          >
            Send 💬
          </button>
        </div>
      </div>
    </div>
  );
}
