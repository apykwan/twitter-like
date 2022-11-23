const express = require('express');

const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  Post.find()
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error)
      res.sendStatus(400);
    });
});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content params not sent with request");
    return res.sendStatus(400);
  }

  const postData = {
    content: req.body.content,
    postedBy: req.session.user
  }

  Post.create(postData)
    .then(async newPost => {
      newPost = await User.populate(newPost, { path: "postedBy" });
      
      res.status(201).send(newPost);
    })
    .catch(error => res.sendStatus(400));
});

module.exports = router;