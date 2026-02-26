import { checkAuth } from "../controllers/auth.controllers.js";
import express from "express";
import { signup, login, logout, updateProfile, requestPasswordReset, resetPasswordWithOtp } from "../controllers/auth.controllers.js";
import {protectRoute} from "../../middleware/auth.middleware.js";
const router=express.Router();

router.post("/signup",signup);
router.post("/login",login );
router.post("/logout",logout );
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithOtp);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute,checkAuth)

export default router;
