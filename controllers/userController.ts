
import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

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

