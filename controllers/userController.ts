
import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userName, bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        userName,
        bio,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};




export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

