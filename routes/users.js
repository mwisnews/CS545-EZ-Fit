const express = require("express");
const router = express.Router();
const userData = require("../data/userData");
const goalData = require("../data/goalData");

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

router.get("/editActivity", async (req, res) => {
  try {
    // Get all goals
    let goalInfo = await goalData.getAllGoals();
    let goalArray = [];
    for (let i = 0; i < goalInfo.length; i++) {
      goalArray.push([goalInfo[i]._id, goalInfo[i].description]);
    }
    // Finally, render the page with the information
    res.render("pages/editActivity", {
      stylesheets: ["/public/css/activity.css"],
      goalSelects: goalArray,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/editActivity", async (req, res) => {
  try {
    const oldStrings = req.body.oldActivity;
    let oldActivity = [
      oldStrings[0],
      oldStrings[1],
      [oldStrings[2], parseFloat(oldStrings[3])],
      oldStrings[4],
      oldStrings[5] === "true",
    ];
    console.log(oldActivity);
    await userData.removeActivity(req.session.userID, oldActivity);
    console.log(req.body);
    let newActivity = [
      req.body.exerciseDate,
      req.body.exerciseGoal,
      [req.body.exerciseType, parseFloat(req.body.exerciseAmount)],
      req.body.exerciseDesc.trim(),
    ];
    await userData.addNewActivity(req.session.userID, newActivity);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
