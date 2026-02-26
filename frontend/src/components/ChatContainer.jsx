import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDownload = async (imageUrl, messageId) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attachment-${messageId}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === authUser._id;
          return (
            <div
              key={message._id}
              className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
              ref={messageEndRef}
            >
              <div className="size-10 rounded-full border flex-shrink-0">
                <img
                  src={
                    isCurrentUser
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-xs`}>
                <time className="text-xs opacity-50 mb-1">
                  {formatMessageTime(message.createdAt)}
                </time>
                <div className={`px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {message.image && (
                    <div className="space-y-2">
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(message.image)}
                      />
                      <button
                        onClick={() => handleDownload(message.image, message._id)}
                        className="flex items-center gap-1 text-xs mt-1 hover:opacity-70 transition-opacity"
                        title="Download attachment"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-2xl max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              title="Close preview"
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatContainer;