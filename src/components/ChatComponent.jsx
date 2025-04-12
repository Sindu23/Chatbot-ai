import React, { useState, useEffect } from "react";
import { fetchResponse } from "../services/api";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import Sidebar from "./Sidebar"; // Import Sidebar component
import { SendHorizonal, Loader, Sun, Moon, Mic, Sidebar as SidebarIcon } from "lucide-react"; // Import Menu icon

const ChatComponent = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hello! How can I assist you today?" } // Default message
  ]);
  const [conversations, setConversations] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const { isListening, listen } = useVoiceAssistant();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
           (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };  

  const startNewChat = () => {
    if (chatHistory.length > 0) {
      setConversations([{ title: chatHistory[0]?.text.slice(0, 20) || "New Chat", history: chatHistory }, ...conversations]);
    }
    setChatHistory([
      { role: "ai", text: "Hello! How can I assist you today?" } // Reset to default message
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
      setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't respond." }]);
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
  
    // Trim extra spaces
    const trimmed = text.trim();
  
    // Capitalize the first letter
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  
    // Add period if it's not there
    const punctuated = /[.?!]$/.test(capitalized) ? capitalized : capitalized + ".";
  
    return punctuated;
  };  

  const handleVoice = () => {
    listen((transcript) => {
      const formatted = formatTranscript(transcript);
      setUserInput(formatted);
      setTimeout(() => {
        handleSend(); // Optional: auto-send
      }, 500);
    });
  };   

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar 
          conversations={conversations} 
          startNewChat={startNewChat} 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode} 
        />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${darkMode ? "bg-zinc-950 text-white" : "bg-white text-gray-900"}`}>
        <header className={`p-4 text-center flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-gray-200"} sticky top-0 z-10`}>
          <div className="flex items-center gap-4">
            {!sidebarOpen && ( // Only show the button when the sidebar is closed
              <button
                onClick={toggleSidebar} // Sidebar toggle button
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <SidebarIcon className="text-white" />
              </button>
            )}
              <h1 className="text-xl font-bold">Chat with AI</h1>
          </div>
          <button
            onClick={() => setDarkMode((prev) => !prev)} // Improved state update
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-900" />}
          </button>
        </header>

        <div className="flex-1 flex flex-col mx-42">  
          {/* Chat History */}
          {/* Chat History */}
<div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-900">
  {chatHistory.map((message, index) => (
    <div
      key={index}
      className={`p-3 max-w-[60%] rounded-lg ${
        message.role === "user"
          ? "bg-blue-600 ml-auto text-white"
          : darkMode
          ? "bg-gray-700 text-white"
          : "bg-gray-300 text-gray-900"
      }`}
    >
      <p dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, "<br>") }} />

    </div>
  ))}
  {loading && (
    <div className="flex justify-center">
      <Loader className="animate-spin text-gray-500" />
    </div>
  )}
</div>


          {/* Input Box */}
<div className={`p-4 mb-4 ${darkMode ? "bg-neutral-800" : "bg-gray-300"} rounded-lg sticky bottom-4 left-0 right-0 z-10`}>
  <div className="relative flex flex-col items-start">
    {/* Input Field */}
    <input
      type="text"
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSend();
      }}
      placeholder="Type your message..."
      className={`w-full p-0 mb-1 focus:outline-none transition ${
        darkMode
          ? "text-white placeholder-gray-400"
          : "text-gray-900 placeholder-gray-600"
      }`}
      style={{
        backgroundColor: "transparent", // Remove background color
        border: "none", // Remove border
      }}
    />

    {/* Buttons Container */}
    <div className="flex items-center gap-2 self-end">
      {/* Microphone Button */}
      <button
  onClick={handleVoice}
  className={`p-2 rounded-full transition ${isListening ? "bg-blue-600" : "hover:bg-gray-600"}`}
>
  <Mic className={isListening ? "animate-pulse text-white" : "text-gray-400"} />
</button>



      {/* Send Button */}
      <button
        onClick={handleSend}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin text-gray-400" /> : <SendHorizonal className="text-white" />}
      </button>
    </div>
  </div>
</div>
</div>
      </div>
    </div>
  );
};

export default ChatComponent;