const express = require('express');

const Post = require('../../schemas/Post');
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
    const results = await Chat
      .find({ users: { $elemMatch: { $eq: req.session.user._id }}})
      .sort({ updatedAt: -1 })
      .populate("users");
      
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


module.exports = router;