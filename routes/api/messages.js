const express = require('express');

const Message = require('../../schemas/Message');
const Chat = require('../../schemas/Chat');
const User = require('../../schemas/User');
const Notification = require('../../schemas/Notification');

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

    let chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    insertNotifications(chat, message);

    res.status(201).send(message);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

function insertNotifications(chat, message) {
  chat.users.forEach(function(userId) {
    // avoid notifiying yourself  
    if(String(userId) === String(message.sender._id)) return;

    Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
  });
}

module.exports = router;