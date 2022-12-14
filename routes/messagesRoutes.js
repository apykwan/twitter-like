const express = require('express');

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

router.get("/:chatid", (req, res, next) => {
  const payload = {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };
  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("chatPage", payload);
});

module.exports = router;