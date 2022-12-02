const express = require('express');

const router = express.Router();

router.get("/:id", (req, res, next) => {
  const payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id
  };

  res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("postPage", payload);
});

module.exports = router;