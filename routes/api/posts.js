const express = require('express');

const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  Post.find()
    .populate("postedBy")
    .sort({ "createdAt": -1 })
    .then(results => {
      res.status(200).send(results)
    })
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

// Like button
router.put("/:id/like", async (req, res, next) => {
  if (!req.session.user) return;
  const postId = req.params.id;
  const userId = req.session.user._id;

  const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
  
  // toggle between like and dislike
  const option = isLiked ? "$pull" : "$addToSet";

  try {
    // Insert user like
    req.session.user = await User
      .findByIdAndUpdate(userId, { [option]: { likes: postId }}, {
        new: true
      });

    // Insert post like
    const post = await Post
      .findByIdAndUpdate(postId, { [option]: { likes: userId }}, {
        new: true
      });

    res.status(201).send(post);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

// Retweet button
router.post("/:id/retweet", async (req, res, next) => {
  if (!req.session.user) return;
  const postId = req.params.id;
  const userId = req.session.user._id;

  console.log('post: ', postId, 'user: ', userId);

  try {
    // Try and delete retreet
    const deletedPost = await Post.findOneAndDelete({ 
      postedBy: userId, 
      retweetData: postId 
    });
    
    // toggle between like and dislike
    const option = deletedPost != null ? "$pull" : "$addToSet";

    let repost = deletedPost;

    if (repost == null) {
      repost = await Post.create({
        postedBy: userId,
        retweetData: postId
      });
    }

    // Insert user like
    req.session.user = await User
      .findByIdAndUpdate(userId, { [option]: { retweets: repost._id }}, {
        new: true
      });

    // Insert post like
    const post = await Post
      .findByIdAndUpdate(postId, { [option]: { retweetUsers: userId }}, {
        new: true
      });

    res.status(200).send(post);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});


module.exports = router;