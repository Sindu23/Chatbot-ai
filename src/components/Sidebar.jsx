import React from "react";
import { Plus, Sidebar as SidebarIcon } from "lucide-react";
import { toast } from "react-toastify";

const Sidebar = ({ conversations, startNewChat, toggleSidebar, darkMode, chatHistory }) => {
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
    <aside
      className={`w-60 p-4 flex flex-col ${
        darkMode ? "bg-neutral-900 text-white" : "bg-gray-200 text-gray-900"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`mb-4 p-2 rounded-full ${
          darkMode 
        } transition`}
      >
        <SidebarIcon className={darkMode ? "text-white" : "text-gray-900"} />
      </button>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        <Plus size={18} /> New Chat
      </button>

      <h2 className={`mt-8 text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        History
      </h2>

      {/* Chat History */}
      <div className="mt-2 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            No previous chats
          </p>
        ) : (
          conversations.map((conv, index) => (
            <button
              key={index}
              className={`block w-full text-left px-3 py-2 mt-2 rounded-lg ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-900"
              }`}
            >
              {conv.title}...
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;