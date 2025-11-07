import Chat from "../models/Chat.js";

// Create new chat
export const createChat = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const chatData = {
      userId: req.user._id,
      userName: req.user.name,
      name: "New Chat",
      messages: []
    };

    const newChat = await Chat.create(chatData);
    res.json({ success: true, message: "Chat created", chat: newChat });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Get all chats
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const result = await Chat.deleteOne({ _id: chatId, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.json({ success: false, message: "Chat not found or unauthorized" });
    }

    res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
