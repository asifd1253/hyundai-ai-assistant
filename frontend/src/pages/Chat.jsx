import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Navbar from "../components/Navbar";
import api from "../services/api";

import "./Chat.css";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    // Display the user's question immediately.
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/chat/ask", {
        question: trimmedQuestion,
      });

      const { answer, sources } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          sources: sources || [],
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to generate an answer. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="chat-page">
        <div className="chat-container">
          {/* Chat Header */}
          <header className="chat-header">
            <h1>Hyundai AI Assistant</h1>
            <p>Ask questions about your uploaded Hyundai brochures.</p>
          </header>

          {/* Chat Messages */}
          <section className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <h2>How can I help you?</h2>
                <p>
                  Ask me about vehicle features, specifications, safety,
                  technology, and more.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <article key={index} className={`chat-message ${message.role}`}>
                <div className="message-content">
                  <strong>
                    {message.role === "user" ? "You" : "Hyundai AI"}
                  </strong>

                  {/* Render user messages as plain text and AI messages as Markdown */}
                  <div className="message-text">
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Source References */}
                  {message.role === "assistant" &&
                    message.sources?.length > 0 && (
                      <div className="message-sources">
                        <strong>Sources</strong>

                        <div className="source-list">
                          {message.sources.map((source, sourceIndex) => (
                            <span key={sourceIndex}>
                              Page {source.pageNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </article>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="chat-loading">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <p>Generating answer...</p>
              </div>
            )}

            {/* Error Message */}
            {error && <p className="chat-error">{error}</p>}
          </section>

          {/* Chat Input */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about Hyundai vehicles..."
              disabled={loading}
            />

            <button type="submit" disabled={!question.trim() || loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Chat;
