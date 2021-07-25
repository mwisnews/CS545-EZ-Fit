const express = require("express");
const router = express.Router();
const goalData = require("../data/goalData")

router.get("/", async (req, res) => {
  try {
    const userGoals = await goalData.getAllGoals();

    res.render("pages/goals", { userGoals });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    console.log('got post with body', req.body);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
