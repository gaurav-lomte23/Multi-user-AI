import React from "react";

function MessageList({ messages }) {
  return (
    <div className="w-full max-w-md h-80 overflow-y-auto border rounded p-2 bg-white shadow">
      {messages.map((msg, i) => (
        <div key={i} className="p-2 border-b text-sm">
          <b>{msg.sender}:</b> {msg.text}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
