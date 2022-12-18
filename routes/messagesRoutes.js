const express = require('express');
const { isValidObjectId, Types } = require('mongoose');

const Chat = require('../schemas/Chat');
const User = require('../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };
  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("inboxPage", payload);
});

router.get("/new", (req, res, next) => {
  const payload = {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };
  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("newMessage", payload);
});

router.get("/:chatId", async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;
  const isValidId = isValidObjectId(chatId);

  const payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    chat: { _id: "" }
  };

  if(!isValidId) {
    payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
    return res
      .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
      .status(200)
      .render("chatPage", payload);
  }

  try {
    let chat = await Chat
      .findOne({ 
        _id: chatId, 
        users: { $elemMatch: { $eq: userId }}
      })
      .populate("users");
    
    if (chat == null) {
      // Check if chat id is really user id
      const userFound = await User.findById(chatId);

      if(userFound != null) {
        // get chat using user id
        chat = await getChatByUserId(userFound._id, userId);
      }
    }

    if (chat == null) {
      payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
    } else {
      payload.chat = chat;
    }

    res
      .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
      .status(200)
      .render("chatPage", payload);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }  
});

function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.
    findOneAndUpdate({
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: Types.ObjectId(userLoggedInId) }},
          { $elemMatch: { $eq: Types.ObjectId(otherUserId) }}
        ]
      }
    }, {
      $setOnInsert: {
        users: [userLoggedInId, otherUserId]
      }
    }, {
      new: true,
      upsert: true
    })
    .populate("users");
}

module.exports = router;