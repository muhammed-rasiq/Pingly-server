
import express from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware"
import { getProfile } from "../controllers/userController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

export default router;
