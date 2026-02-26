import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SideBarSkelton";
import { Users, Pin, Trash2 } from "lucide-react";

const Sidebar = () => {
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    unreadMessages,
    pinnedUsers,
    togglePinUser,
    getPinnedUsers,
    getNonPinnedUsers,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showPinMenu, setShowPinMenu] = useState(null);

  console.log("Online Users in Sidebar:", onlineUsers);
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const pinnedUsersData = getPinnedUsers();
  const nonPinnedUsers = getNonPinnedUsers();

  const filteredPinned = showOnlineOnly
    ? pinnedUsersData.filter((user) => onlineUsers.includes(user._id))
    : pinnedUsersData;

  const filteredNonPinned = showOnlineOnly
    ? nonPinnedUsers.filter((user) => onlineUsers.includes(user._id))
    : nonPinnedUsers;

  if (isUsersLoading) return <SidebarSkeleton />;

  const renderUserButton = (user) => (
    <div key={user._id} className="relative">
      <button
        onClick={() => setSelectedUser(user)}
        className={`
          w-full p-3 flex items-center gap-3
          hover:bg-base-300 transition-colors
          ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
        `}
      >
        <div className="relative mx-auto lg:mx-0">
          <img
            src={user.profilePic || "/avatar.png"}
            alt={user.name}
            className="size-12 object-cover rounded-full"
          />
          {onlineUsers.includes(user._id) && (
            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
              rounded-full ring-2 ring-zinc-900"
            />
          )}
        </div>

        {/* User info - only visible on larger screens */}
        <div className="hidden lg:block text-left min-w-0 flex-1">
          <div className="font-medium truncate">{user.fullName}</div>
          {user.lastMessage ? (
            <div className="text-sm text-zinc-400 truncate">
              {user.lastMessage.image ? (
                <span className="italic">🖼️ Photo</span>
              ) : (
                user.lastMessage.text?.substring(0, 50) || "No message"
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              {onlineUsers.includes(user._id) ? "Online" : "Offline"}
            </div>
          )}
        </div>

        {/* Unread badge - show red circle with count like WhatsApp */}
        {user.unreadCount > 0 && (
          <div className="ml-auto hidden lg:flex items-center justify-center">
            <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs rounded-full font-semibold">
              {user.unreadCount > 99 ? "99+" : user.unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Pin button on hover */}
      <button
        onClick={() => togglePinUser(user._id)}
        className="absolute top-2 right-2 lg:top-3 lg:right-3 p-1 hover:bg-base-200 rounded hidden lg:block"
        title={pinnedUsers.includes(user._id) ? "Unpin user" : "Pin user"}
      >
        <Pin
          className={`size-4 ${
            pinnedUsers.includes(user._id) ? "fill-yellow-500 text-yellow-500" : "text-zinc-400"
          }`}
        />
      </button>
    </div>
  );

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Pinned Users Section */}
        {filteredPinned.length > 0 && (
          <>
            <div className="px-3 py-2 hidden lg:block">
              <p className="text-xs font-semibold text-zinc-500 uppercase">📌 Pinned</p>
            </div>
            {filteredPinned.map(renderUserButton)}
            {filteredNonPinned.length > 0 && (
              <div className="hidden lg:block border-t border-base-300 my-2"></div>
            )}
          </>
        )}

        {/* All Users / Non-pinned Users */}
        {filteredNonPinned.length > 0 && (
          <>
            {filteredPinned.length === 0 && (
              <div className="px-3 py-2 hidden lg:block">
                <p className="text-xs font-semibold text-zinc-500 uppercase">All Contacts</p>
              </div>
            )}
            {filteredNonPinned.map(renderUserButton)}
          </>
        )}

        {(filteredPinned.length === 0 && filteredNonPinned.length === 0) && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;