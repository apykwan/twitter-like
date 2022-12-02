const express = require('express');

const router = express.Router();

router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.userName,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user
  };

  res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("profilePage", payload);
});

module.exports = router;