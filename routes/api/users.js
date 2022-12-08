const express = require('express');

const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

const router = express.Router();

router.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;

  try {
    // check if userId is valid in DB
    const user = await User.findById(userId);
    if (user == null) return res.sendStatus(400);

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";

    // update user's following list
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id, 
      { [option]: { following: userId } }, 
      { new: true }
    );

    // update the user being followed
    await User.findByIdAndUpdate(
      userId, 
      { [option]: { followers: req.session.user._id } }, 
      { new: true }
    );

    res.status(200).send(req.session.user); 
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

// output following users
router.get("/:userId/following", async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User
      .findById(userId)
      .populate("following");

    res.status(200).send(user); 
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.get("/:userId/followers", async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User
      .findById(userId)
      .populate("followers");

    res.status(200).send(user); 
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

module.exports = router;