
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};



export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const otp = randomInt(100000, 1000000).toString();

    // Store hashed OTP
    user.resetOTP = await bcrypt.hash(otp, 10);
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Pingly Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    });

    return res.status(200).json({
      message: "OTP sent to your email"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};



export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetOTP || !user.resetOTPExpires) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.resetOTPExpires < new Date()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};
