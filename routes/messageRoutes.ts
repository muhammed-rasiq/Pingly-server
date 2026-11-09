
import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  sendMessage,
  getMessages,markMessagesRead
} from "../controllers/messageController";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/:userId", verifyToken, getMessages);
router.patch("/read/:userId", verifyToken, markMessagesRead);

export default router;
