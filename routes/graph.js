const express = require("express");
const router = express.Router();
const userData = require("../data/userData");

router.get("/line", async (req, res) => {
  // Get all of the workout types the user has done
  try {
    const workouts = await userData.getUserByID(req.session.userID);
    if (!workouts.pastActivities) {
      throw `User does not have pastActivities!`;
    }
    const workoutSet = new Set();
    for (let i = 0; i < workouts.pastActivities.length; i++) {
      const currWorkout = workouts.pastActivities[i][2][0];
      workoutSet.add(currWorkout);
    }
    res.render("pages/lineGraph", { workoutList: Array.from(workoutSet) });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
