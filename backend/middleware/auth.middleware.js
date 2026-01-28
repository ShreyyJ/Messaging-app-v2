import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try{
        // Try to get token from Authorization header first, then fall back to cookies
        let token = req.cookies.jwt;
        
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.slice(7); // Remove "Bearer " prefix
            }
        }
        
        if(!token){
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({ message: "Unauthorized, Invalid Token" });
        }
        const user = await User.findById(decoded.userId).select("-password");
         
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        
        // prefer profilePic but fallback to legacy profile
        user.profilePic = user.profilePic || user.profile || "";
        req.user = user;

        next();

    } catch (error) {
      console.log("Error in protectRoute middleware: ", error.message);
      res.status(500).json({message:"Internal server error"});
    }
}; 