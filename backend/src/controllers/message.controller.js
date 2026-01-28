import User from "../../models/user.model.js";
import Message from "../../models/messages.js";

import cloudinary from "../../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../../lib/socket.js";

export const getUsersForSidebar=async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
        // Exclude password but include other user fields (fullName, profilePic, email, etc.)
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
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
        });

        await newMessage.save();

        //todo:realtime functionality goes here with socket.io
        
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
    }catch(error){
        console.log("Error in sendMessage: ", error.message);
        res.status(500).json({error:"Internal Server error"});
    }
};