
import express from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware"
import { getProfile,updateProfile } from "../controllers/userController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;
