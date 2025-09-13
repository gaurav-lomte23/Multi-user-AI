import React, { useState } from "react";

function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="mt-2 flex w-full max-w-md">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-l px-2 py-1"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 rounded-r"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
