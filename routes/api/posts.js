const express = require('express');

const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

const router = express.Router();

/** GET All Posts */
router.get("/", async (req, res, next) => {
  const searchObj = req.query;

  if(searchObj.isReply !== undefined) {
    const isReply = searchObj.isReply == "true";
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  // Only fetch the following user and self posts
  if (searchObj.followingOnly !== undefined) {
    const followingOnly = searchObj.followingOnly == "true";

    if (followingOnly) {
      const objectIds = []; 

      if (!req.session.user.following) req.session.user.following = [];

      req.session.user.following.forEach(user => {
        objectIds.push(user);
      });

      objectIds.push(req.session.user._id);
      searchObj.postedBy = { $in: objectIds };
    }

    delete searchObj.followingOnly;
  }

  const results = await getPosts(searchObj);
  res.status(200).send(results); 
});

/** GET Single Post */
router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;
  let postData = await getPosts({ _id: postId });
  postData = postData[0];

  const results = {
    postData
  };

  if (postData && postData.reply !== undefined) {
    results.replyto = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId })

  res.status(200).send(results);
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

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  Post.create(postData)
    .then(async newPost => {
      newPost = await User.populate(newPost, { path: "postedBy" });
      
      res.status(201).send(newPost);
    })
    .catch(error => res.sendStatus(400));
});

/**PUT like button */
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

/**PUT Retweet button */
router.post("/:id/retweet", async (req, res, next) => {
  if (!req.session.user) return;
  const postId = req.params.id;
  const userId = req.session.user._id;

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

/**DELETE delete a post */
router.delete(`/:id`, async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);

    res.sendStatus(202);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

async function getPosts(filter = {}) {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ "createdAt": -1 })
    .catch(error => {
      console.log(error)
      res.sendStatus(400);
    });

  results = await User.populate(results, { path: "replyTo.postedBy"});
  return await User.populate(results, { path: "retweetData.postedBy"});
}

module.exports = router;