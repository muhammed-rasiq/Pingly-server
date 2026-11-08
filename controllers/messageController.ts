
import { Response } from "express";
import User from "../models/User";
import Message from "../models/Message";
import { AuthRequest } from "../middleware/authMiddleware";

// SEND MESSAGE
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message?.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required"
      });
    }

    if (receiver === req.userId) {
      return res.status(400).json({
        message: "You cannot send a message to yourself"
      });
    }

    const receiverUser = await User.findById(receiver);

    if (!receiverUser || !receiverUser.isActive) {
      return res.status(404).json({
        message: "Receiver not found"
      });
    }

    const newMessage = await Message.create({
      sender: req.userId,
      receiver,
      message
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// GET CHAT MESSAGES
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Messages fetched successfully",
      messages
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};
