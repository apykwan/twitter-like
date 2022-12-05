const express = require('express');

const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

const router = express.Router();

router.put("/:userId/follow", async (req, res, next) => {
  const results = await User.findById(req.params.userId);
  res.status(200).send(results); 
});

module.exports = router;