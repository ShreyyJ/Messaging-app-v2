import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {}, // Track unread messages per user
  pinnedUsers: JSON.parse(localStorage.getItem("pinnedUsers")) || [], // Load pinned users from localStorage

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      console.log("Fetching users for sidebar...");
      const res = await axiosInstance.get("/messages/users");
      console.log("Fetched users for sidebar:", res.data);
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Clear unread count for this user
      const { unreadMessages } = get();
      const updated = { ...unreadMessages };
      delete updated[userId];
      set({ unreadMessages: updated });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    
    // Remove any existing listeners first to avoid duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Listen for new messages from any user and update user list
  listenForNewMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, users, unreadMessages } = get();
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser?._id;

      // If message is from selected user, add to messages
      if (isMessageFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });
      } else {
        // If not from selected user, mark as unread and move to top
        const updated = { ...unreadMessages };
        updated[newMessage.senderId] = (updated[newMessage.senderId] || 0) + 1;
        set({ unreadMessages: updated });

        // Reorder users list: move sender to top
        const reorderedUsers = users.filter((u) => u._id !== newMessage.senderId);
        const senderUser = users.find((u) => u._id === newMessage.senderId);
        if (senderUser) {
          set({ users: [senderUser, ...reorderedUsers] });
        }

        // Send browser notification
        get().sendNotification(senderUser?.fullName || "New message", newMessage.text || newMessage.image ? "[Image]" : "");
      }
    });
  },

  sendNotification: (title, body) => {
    // Request notification permission if not already granted
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body || "You have a new message",
        icon: "/logo.png",
        badge: "/logo.png",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: body || "You have a new message",
            icon: "/logo.png",
            badge: "/logo.png",
          });
        }
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  togglePinUser: (userId) => {
    const { pinnedUsers } = get();
    const updated = pinnedUsers.includes(userId)
      ? pinnedUsers.filter((id) => id !== userId)
      : [userId, ...pinnedUsers];
    
    set({ pinnedUsers: updated });
    localStorage.setItem("pinnedUsers", JSON.stringify(updated));
  },

  getPinnedUsers: () => {
    const { users, pinnedUsers } = get();
    return users.filter((u) => pinnedUsers.includes(u._id));
  },

  getNonPinnedUsers: () => {
    const { users, pinnedUsers } = get();
    return users.filter((u) => !pinnedUsers.includes(u._id));
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
