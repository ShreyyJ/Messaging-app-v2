import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages ,sendMessage} from "../controllers/message.controller.js";
const router = express.Router();

// GET /api/messages/users
router.get("/users", protectRoute, getUsersForSidebar);
// GET /api/messages/:id
router.get("/:id", protectRoute, getMessages);
// POST /api/messages/send/:id
router.post("/send/:id", protectRoute, sendMessage);

export default router; 