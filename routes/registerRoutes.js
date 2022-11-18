const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../schemas/User');

const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

router.post("/", async (req, res, next) => {
  const firstName = req.body.firstName.trim(); 
  const lastName = req.body.lastName.trim();
  const userName = req.body.userName.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  const payload = req.body;

  if (firstName && lastName && userName && email && password) {
    const user = await User.findOne({ 
      $or: [
        { userName: userName },
        { email: email }
      ]
    })
      .catch(err => {
        payload.errorMessage = "Something went wrong!";
        res.status(200).render("register", payload);
      });

    if (!user) {
      // No user found
      const data = req.body;

      data.password = await bcrypt.hash(password, 10);

      User.create(data)
        .then(user => {
            req.session.user = user;
            return res.redirect("/");
        })

    } else {
      // User found
      if (email === user.email) {
        payload.errorMessage = "Email already in use."
      } else {
        payload.errorMessage = "Username is alrady in use"
      }
      res.status(200).render("register", payload);
    }

  } else {
    payload.errorMessage = "Make sure each field has a valid value!";
    res.status(200).render("register", payload);
  }
});

module.exports = router;