
import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  sendMessage,
  getMessages
} from "../controllers/messageController";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/:userId", verifyToken, getMessages);

export default router;
