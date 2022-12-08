const express = require('express');
const { ObjectId } = require('mongoose').Types; 

const User = require('../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {

  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user
  }
    
  res.status(200).render("profilePage", payload);
});

router.get("/:username", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);

  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("profilePage", payload);
});

router.get("/:username/replies", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "replies"

  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("profilePage", payload);
});

router.get("/:username/following", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "following"

  res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("followersAndFollowing", payload);
});

router.get("/:username/followers", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "followers"

  res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("followersAndFollowing", payload);
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