const express = require('express');

const Notification = require('../../schemas/Notification');

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const searchObj = { 
      userTo: req.session.user._id, 
      notificationType: { $ne: "newMessage" }
    };

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true")  {
      searchObj.opened = false;
    }

    const results = await Notification
    .find(searchObj)
    .populate("userFrom")
    .sort({ createdAt: -1 });

    res.status(200).send(results);
  } catch (err) {
    res.sendStatus(400);
  }
});

router.get("/latest", async (req, res, next) => {
  try {
    const results = await Notification
    .findOne({ 
      userTo: req.session.user._id
    })
    .populate("userFrom")
    .sort({ createdAt: -1 });

    res.status(200).send(results);
  } catch (err) {
    res.sendStatus(400);
  }
});

router.put("/:id/markAsOpened", async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { opened: true });

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});

router.put("/markAsOpened", async (req, res, next) => {
  try {
    await Notification.updateMany({
      userTo: req.session.user._id
    }, { opened: true });
    
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});

module.exports = router;