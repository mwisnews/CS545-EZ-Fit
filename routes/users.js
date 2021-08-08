const express = require("express");
const router = express.Router();
const userData = require("../data/userData");

router.get("/activities", async (req, res) => {
  if (!req.session.userID) {
    res.sendStatus(403);
  }
  // Make the data fetch
  const userActivities = await userData.getUserByID(req.session.userID);
  res.json(userActivities.pastActivities);
});

router.put("/deleteActivity", async (req, res) => {
  try {
    let activity = await userData.removeActivity(
      req.session.userID,
      req.body.activity
    );
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
