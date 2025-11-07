import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";
import { maskPII, unmaskPII } from "../utils/piimasker.js"; 

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // Mask PII before sending to AI
    const { masked, map } = maskPII(prompt);
    console.log(masked);
    
    // Save user message (masked content)
    chat.messages.push({
      role: "user",
      content: masked,
      timestamp: Date.now(),
      isImage: false,
    });

    // Send masked prompt to AI
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: masked }],
    });

    // Get AI reply and unmask
    const rawReply = choices[0].message;
    console.log(rawReply);
    const unmaskedContent = unmaskPII(rawReply.content, map);

    const reply = {
      ...rawReply,
      content: unmaskedContent,
      timestamp: Date.now(),
      isImage: false,
    };

    // Send unmasked reply to client
    res.json({ success: true, reply });

    // Store masked reply in DB (safe from PII)
    chat.messages.push({
      role: "assistant",
      content: rawReply.content, 
      timestamp: reply.timestamp,
      isImage: false,
    });

    await chat.save();
    await User.updateOne({ _id: userId });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// IMAGE GENERATION CONTROLLER

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    const { prompt, chatId, isPublished } = req.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // Mask PII before encoding the prompt
    const { masked } = maskPII(prompt);

    // Push user message (masked)
    chat.messages.push({
      role: "user",
      content: masked,
      timestamp: Date.now(),
      isImage: false,
    });

    // Generate image from masked prompt
    const encodedPrompt = encodeURIComponent(masked);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    // Trigger AI image generation
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
