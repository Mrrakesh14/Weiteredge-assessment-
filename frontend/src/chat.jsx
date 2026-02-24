import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import axios from "axios";

export default function Chat() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("sessionId");

    if (!id) {
      id = uuid();
      localStorage.setItem("sessionId", id);
    }

    setSessionId(id);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        sessionId,
        message: input,
      });

      const botMsg = {
        role: "assistant",
        content: res.data.reply,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient">
      {/* Chat Container */}
      <div className="w-full max-w-3xl h-[80vh] bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 text-center text-white text-xl font-semibold border-b border-white/20">
          AI Support Assistant
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs text-sm shadow ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-white text-sm opacity-80">AI is typing...</div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20 flex gap-2">
          <input
            className="flex-1 px-4 py-2 rounded-lg bg-white/80 focus:outline-none"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
