
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



export const markMessagesRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    return res.status(200).json({
      message: "Messages marked as read"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};



export const getConversations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("sender", "userName profileImage")
      .populate("receiver", "userName profileImage");

    const conversations = new Map();

    for (const msg of messages) {
      const sender: any = msg.sender;
      const receiver: any = msg.receiver;

      const otherUser =
        sender._id.toString() === req.userId
          ? receiver
          : sender;

      const otherUserId = otherUser._id.toString();

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      // Count unread messages received from this user
      if (
        sender._id.toString() === otherUserId &&
        receiver._id.toString() === req.userId &&
        !msg.isRead
      ) {
        conversations.get(otherUserId).unreadCount++;
      }
    }

    return res.status(200).json({
      success: true,
      conversations: Array.from(conversations.values())
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations"
    });
  }
};
