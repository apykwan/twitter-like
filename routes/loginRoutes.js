const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).render("login");
});

router.post("/", async (req, res, next) => {
  const payload = req.body;

  if (req.body.logUsername && req.body.logPassword) {
    const user = await User.findOne({ 
      $or: [
        { userName: req.body.logUsername },
        { email: req.body.logUsername }
      ]
    })
      .catch(err => {
        payload.errorMessage = "Something went wrong!";
        res.status(200).render("login", payload);
      });

    if (user !== null) {
      const verifyUser = await bcrypt.compare(req.body.logPassword, user.password);
      if (verifyUser === true) {
        req.session.user = user;
        return res.redirect("/");
      }
    }

    payload.errorMessage = "Login credentials incorrect!";
    return res.status(200).render("login", payload);
  }
 
  payload.errorMessage = "Make sure each field has a valid value!";
  res.status(200).render("login", payload);
});

module.exports = router;