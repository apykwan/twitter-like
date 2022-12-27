const express = require('express');

const Message = require('../../schemas/Message');
const User = require('../../schemas/User');
const Chat = require('../../schemas/Chat');

const router = express.Router();

router.post("/", async (req, res, next) => {
  if(!req.body.users) {
    console.log("Users param not sent with request");
    return res.sendStatus(400);
  }

  const users = JSON.parse(req.body.users);
  
  if(users.length == 0) {
    console.log("Users array is empty");
    return res.sendStatus(400);
  }

  // push self to the chat users array
  users.push(req.session.user);

  const chatData = {
    users,
    isGroupChat: true
  };

  try {
    const results = await Chat.create(chatData);
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.get("/", async (req, res, next) => { 
  try {
    let results = await Chat
      .find({ users: { $elemMatch: { $eq: req.session.user._id }}})
      .populate("users")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true")  {
      results = results.filter(r => !r.latestMessage.readBy.includes(req.session.user._id));
    }
    results = await User.populate(results, { path: "latestMessage.sender" });
      
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.get("/:chatId", async (req, res, next) => { 
  try {
    const results = await Chat
      .findOne({
        _id: req.params.chatId, 
        users: { $elemMatch: { $eq: req.session.user._id }}
      })
      .populate("users");
      
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.put("/:chatid", async (req, res, next) => { 
  try {
    await Chat.findByIdAndUpdate(req.params.chatid, { chatName: req.body.chatName });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.get("/:chatId/messages", async (req, res, next) => { 
  try {
    const results = await Message
      .find({ chat: req.params.chatId})
      .populate("sender");
      
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

module.exports = router;