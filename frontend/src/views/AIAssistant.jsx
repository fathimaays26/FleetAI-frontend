import { useState } from "react";
import ReactMarkdown from "react-markdown";
const API_URL = "http://127.0.0.1:8000/api/chat";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I'm FleetGuard AI. I can help you understand fleet risks, component failures, RUL predictions, and maintenance priorities.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "Which vehicles are at highest risk?",
    "Why is VIN000006 high risk?",
    "Which component needs attention first?",
    "Explain the current fleet health",
  ];

  const sendMessage = async (messageText = input) => {
    const text = messageText.trim();

    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    // Add user's message immediately
    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Convert frontend messages to backend format
      const history = messages.map((message) => ({
        role: message.role,
        content: message.text,
      }));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));

  if (response.status === 429) {
    throw new Error(
      "FleetGuard AI has temporarily reached its request limit. Please try again later."
    );
  }

  throw new Error(
    errorData.detail || "FleetGuard AI could not process your request."
  );
}

const data = await response.json();

      // Add actual AI response
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
  error.message ||
  "FleetGuard AI could not process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full min-h-[calc(100vh-140px)] flex flex-col">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <span className="text-xl">✦</span>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Assistant
            </h1>

            <p className="text-sm text-gray-500">
              Ask questions about your fleet and predictive maintenance
            </p>
          </div>
        </div>
      </div>

      {/* CHAT CARD */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        {/* CHAT HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white">
                ✦
              </div>

              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="font-medium text-gray-900">FleetGuard AI</div>

              <div className="text-xs text-green-600">
                {loading ? "Thinking..." : "Ready to assist"}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400">Fleet Intelligence</div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600">✦</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-6 ${
                      isUser
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-md prose prose-sm max-w-none"
                    }`}
                  >
                    {isUser ? (
                      message.text
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc ml-5 space-y-1 mb-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal ml-5 space-y-1 mb-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })}

            {/* LOADING */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <span className="text-purple-600">✦</span>
                </div>

                <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />

                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />

                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="px-6 pb-3">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-medium text-gray-400 mb-2">
              Suggested questions
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                  className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INPUT */}
        <div className="px-6 py-5 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FleetGuard AI anything about your fleet..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                ↑
              </button>
            </div>

            <div className="text-[11px] text-gray-400 mt-2 text-center">
              FleetGuard AI uses your fleet data to provide maintenance
              insights.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
