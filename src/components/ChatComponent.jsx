import React, { useState, useEffect, useRef } from "react";
import { fetchResponse } from "../services/api";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import Sidebar from "./Sidebar"; 
import { SendHorizonal, Loader, Sun, Moon, Mic, Sidebar as SidebarIcon } from "lucide-react"; 
import { toast, ToastContainer } from "react-toastify"; 
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";

const ChatComponent = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hello! How can I assist you today?" } 
  ]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isListening, listen } = useVoiceAssistant();

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const startNewChat = () => {
    if (chatHistory.length > 0) {
      setConversations([
        {
          title: chatHistory[0]?.text.slice(0, 20) || "New Chat",
          history: chatHistory,
        },
        ...conversations,
      ]);
    }
    setChatHistory([
      { role: "ai", text: "Hello! How can I assist you today?" } 
    ]);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    const userMessage = { role: "user", text: userInput };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const aiResponse = await fetchResponse(userInput);
      const botMessage = { role: "ai", text: aiResponse };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't respond." }
      ]);
    } finally {
      setLoading(false);
    }

    setUserInput("");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const formatTranscript = (text) => {
    if (!text) return "";

    const trimmed = text.trim();

    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    const punctuated = /[.?!]$/.test(capitalized)
      ? capitalized
      : capitalized + ".";

    return punctuated;
  };

  const handleVoice = () => {
    listen((transcript) => {
      const formatted = formatTranscript(transcript);
      setUserInput(formatted);
      setTimeout(() => {
        handleSend(); 
      }, 500);
    });
  };

  const handleNewChat = () => {
    const hasUserMessage = chatHistory.some((message) => message.role === "user");

    if (!hasUserMessage) {
      toast.warning("You need to send at least one message to start a new chat!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? "dark" : "light",
      });
      return;
    }

    startNewChat();
  };

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          startNewChat={startNewChat}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          chatHistory={chatHistory}
        />
      )}

      <div
        className={`flex-1 flex flex-col ${darkMode ? "bg-zinc-950 text-white" : "bg-white text-gray-900"
          }`}
      >
        <header
        className={`p-4 text-center flex justify-between items-center border-b border-gray-800  ${darkMode ? "bg-zinc-950" : "bg-white"
        } sticky top-0 z-10`}
        >
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
              >
                <SidebarIcon className="text-white" />
              </button>
            )}
            <h1 className="text-xl font-bold">Chat with AI</h1>
          </div>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            {darkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-gray-500" />
            )}
          </button>
        </header>

        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide w-full max-w-4xl mx-auto" 
            style={{
              maxHeight: "calc(100vh - 160px)", 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`p-3 max-w-[60%] rounded-lg ${message.role === "user"
                    ? "bg-sky-600 ml-auto text-white"
                    : darkMode
                      ? "bg-zinc-800 text-white"
                      : "bg-neutral-200 text-gray-900"
                  }`}
              >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            </div>
            ))}
            {loading && (
              <div className="flex justify-center">
                <Loader className="animate-spin text-gray-500" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className={`p-4 w-full max-w-4xl mx-auto ${darkMode ? "bg-zinc-800" : "bg-neutral-200"
              } sticky bottom-0 left-0 right-0 z-10`}
          >
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleSend();
                }}
                placeholder="Type your message..."
                disabled={loading}
                className={`w-full p-2 rounded-lg focus:outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : " text-gray-900 placeholder-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              <button
                onClick={handleVoice}
                className={`p-2 rounded-full transition ${isListening ? "bg-blue-600" : "hover:bg-gray-600"
                  }`}
              >
                <Mic
                  className={
                    isListening ? "animate-pulse text-white" : "text-gray-400 mt-50px"
                  }
                />
              </button>
              <button
                onClick={handleSend}
                className="p-2 rounded-full bg-sky-600 hover:bg-sky-700 transition"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="animate-spin text-gray-400" />
                ) : (
                  <SendHorizonal className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
<ToastContainer />
    </div>
  );
};

export default ChatComponent;