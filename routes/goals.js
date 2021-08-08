const express = require("express");
const router = express.Router();
const goalData = require("../data/goalData")

router.get("/", async (req, res) => {
  try {
    const userGoals = await goalData.getAllGoals();

    res.render("pages/goals", { userGoals, stylesheets: ['/public/css/goals.css'] });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    let goal = await goalData.createGoal(
      "60f82057e2ef2a7dc3fd5a62",
      req.body.exerciseType,
      req.body.description,
      req.body.target,
      req.body.startDate,
      req.body.endDate,
      false,
      req.body.milestones
    );

    res.json(goal);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
