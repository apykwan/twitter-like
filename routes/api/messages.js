const express = require('express');

const Message = require('../../schemas/Message');
const Chat = require('../../schemas/Chat');
const User = require('../../schemas/User');

const router = express.Router();

router.post("/", async (req, res, next) => {
  if(!req.body.content || !req.body.chatId) {
    console.log("Invalid data passed into request!");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate('sender');
    message = await message.populate('chat');
    message = await User.populate(message, { path: "chat.users" });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    
    res.status(201).send(message);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

module.exports = router;