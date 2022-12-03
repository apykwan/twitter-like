const express = require('express');
const { ObjectId } = require('mongoose').Types; 

const User = require('../schemas/User');

const router = express.Router();

router.get("/:username", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);

  res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("profilePage", payload);
});

async function getPayload (username, userLoggedIn) {
  let user = await User.findOne({ userName: username });

  if (!user) {
    const errorPayload = {
      pageTitle: "User not found",
      userLoggedIn,
      userLoggedInJs: JSON.stringify(userLoggedIn),
    };

    if (!ObjectId.isValid(username)) return errorPayload;

    user = await User.findById(username);

    if (!user) return errorPayload;
  }
  return {
    pageTitle: user.userName,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user
  };
}

module.exports = router;