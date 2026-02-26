import User from "../../models/user.model.js";
import Message from "../../models/messages.js";

import cloudinary from "../../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../../lib/socket.js";

export const getUsersForSidebar=async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
        // Exclude password but include other user fields (fullName, profilePic, email, etc.)
        let filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");

        // Get unread count and last message for each user
        const usersWithUnread = await Promise.all(
            filteredUsers.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: loggedInUserId,
                    isRead: false,
                });

                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: loggedInUserId, receiverId: user._id },
                        { senderId: user._id, receiverId: loggedInUserId },
                    ],
                }).sort({ createdAt: -1 });

                return {
                    ...user.toObject(),
                    unreadCount,
                    lastMessage: lastMessage ? {
                        text: lastMessage.text,
                        image: lastMessage.image,
                        senderId: lastMessage.senderId.toString(),
                        createdAt: lastMessage.createdAt,
                    } : null,
                };
            })
        );

        // Sort by last message time (most recent first)
        usersWithUnread.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.status(200).json(usersWithUnread);
    }catch(error){
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({message:"Server error"});
    }
};

export const getMessages = async(req,res)=>{//get messages between logged in user and user whose id is passed in params
    try{
        const {id:userToChatId}=req.params
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ],
        });

        // Mark all messages from the other user as read
        await Message.updateMany(
            {
                senderId: userToChatId,
                receiverId: myId,
                isRead: false,
            },
            { isRead: true }
        );

        res.status(200).json(messages);
    }catch(error){
        console.log("Error in getMessagesWithUser: ", error.message);
        res.status(500).json({error:"Internal Server error"});
    }
};

export const sendMessage=async(req,res)=>{
    try{
        const {text,image}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            //upload image to cloudinary
            const uploadResponse=await cloudinary.uploader.upload(image);
           
            imageUrl=uploadResponse.secure_url;    
    }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
            isRead: false,
        });

        await newMessage.save();

        //todo:realtime functionality goes here with socket.io
        
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      // Also emit unread count and latest message update
      const unreadCount = await Message.countDocuments({
        senderId: senderId,
        receiverId: receiverId,
        isRead: false,
      });
      io.to(receiverSocketId).emit("unreadCountUpdate", {
        senderId,
        unreadCount,
        lastMessage: {
          text: newMessage.text,
          image: newMessage.image,
          createdAt: newMessage.createdAt,
        },
      });
    }

    res.status(201).json(newMessage);
    }catch(error){
        console.log("Error in sendMessage: ", error.message);
        res.status(500).json({error:"Internal Server error"});
    }
};