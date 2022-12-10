const express = require('express');
const { ObjectId } = require('mongoose').Types; 

const User = require('../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  const payload = createPayload(req.session.user);
  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("searchPage", payload);
});

router.get("/:selectedTab", (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .status(200)
    .render("searchPage", payload);
});

function createPayload(userLoggedIn) {
  return {
    pageTitle: "Search",
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn)
  };
}

module.exports = router;