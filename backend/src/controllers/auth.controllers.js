import { generateToken } from "../../lib/utils.js";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../lib/cloudinary.js";
import crypto from "crypto";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if(!fullName ||!email ||!password){
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10); // to hash password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // jwt token can be generated here
        const token = generateToken(savedUser._id, res);

        return res.status(201).json({
            token,
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            profilePic: savedUser.profilePic,
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Server error" });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        // validate input early to avoid null accesses
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        console.log("Checking user");
        const user = await User.findOne({ email }).select("+password");
        console.log("User call complete");

        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
//jwt token can be generated here

const token = generateToken(user._id, res);

res.status(200).json({
    token,
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
});
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });
        }catch(error){
            console.log("Error in logout controller", error.message);
            res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
         const userId=req.user._id;

         if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"});
         }

         const uploadResponse = await cloudinary.uploader.upload(profilePic);
         // save URL to canonical profilePic field
         const updatedUser = await User.findByIdAndUpdate(
           userId,
           { profilePic: uploadResponse.secure_url },
           { new: true }
         );

         // ensure we return the profilePic value even if some users have legacy `profile` field
         const profilePicUrl = updatedUser.profilePic || updatedUser.profile || "";

         // return only the fields frontend expects
         res.status(200).json({
           _id: updatedUser._id,
           fullName: updatedUser.fullName,
           email: updatedUser.email,
           profilePic: profilePicUrl,
           createdAt: updatedUser.createdAt,
           updatedAt: updatedUser.updatedAt
         });
        } catch (error) {
          console.log("error in update Profile:",error);
          res.status(500).json({message:"Internal Server Error"});
        }
    };

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
      console.log("error in checkAuth comtroller :",error.message);
      res.status(500).json({message:"Internal Server Error"});
    }
};

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Do not reveal if the user exists
            return res.status(200).json({ message: "If the email exists, an OTP was sent" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        user.resetOtpHash = otpHash;
        user.resetOtpExpiresAt = expiresAt;
        await user.save();

        // Email sending is deferred; log OTP for now
        console.log(`Password reset OTP for ${email}: ${otp}`);

        return res.status(200).json({ message: "If the email exists, an OTP was sent" });
    } catch (error) {
        console.log("Error in requestPasswordReset", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

export const resetPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (user.resetOtpExpiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        if (otpHash !== user.resetOtpHash) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetOtpHash = "";
        user.resetOtpExpiresAt = null;
        await user.save();

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPasswordWithOtp", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};