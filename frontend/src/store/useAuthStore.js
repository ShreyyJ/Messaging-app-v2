import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:7000" 
  : window.location.origin;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isRequestingReset: false,
  isResettingPassword: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      // Store JWT token in localStorage
      if (res.data) {
        localStorage.setItem("jwt", res.data.token || "");
      }
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Signup failed";
      toast.error(msg);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      // Store JWT token in localStorage
      if (res.data) {
        localStorage.setItem("jwt", res.data.token || "");
      }
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Login failed";
      toast.error(msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("jwt");
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Logout failed";
      toast.error(msg);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      const msg = error?.response?.data?.message || error?.message || "Profile update failed";
      toast.error(msg);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  requestPasswordReset: async (email) => {
    set({ isRequestingReset: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res?.data?.message || "OTP sent if email exists");
      return true;
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Request failed";
      toast.error(msg);
      return false;
    } finally {
      set({ isRequestingReset: false });
    }
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(res?.data?.message || "Password reset successful");
      return true;
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Reset failed";
      toast.error(msg);
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    console.log("connectSocket called, authUser:", authUser);
    
    if (!authUser) {
      console.log("No authUser, returning");
      return;
    }
    
    if (get().socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const token = localStorage.getItem("jwt");
    console.log("Token from localStorage:", token);
    console.log("Connecting to socket at:", BASE_URL);
    
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully!");
      // Start listening for new messages from any user
      import("./useChatStore.js").then((mod) => {
        mod.useChatStore.getState().listenForNewMessages();
      });
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Online users received:", userIds);
      set({ onlineUsers: userIds });
    });

    socket.connect();
    set({ socket: socket });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
