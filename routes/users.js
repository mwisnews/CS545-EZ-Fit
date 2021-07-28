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

module.exports = router;
