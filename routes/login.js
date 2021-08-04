const express = require("express");
const router = express.Router();

const trim = (str) => (str || "").trim();

router.get("/", async (req, res) => res.redirect("/login"));

router.get("/home", async (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("pages/home", { title: "Home Page" });
  }
});

router.get("/login", async (req, res) => {
  try {
    res.render("pages/login", { title: "Login" });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    res.render("pages/home", { title: "Home Page" });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/newUser", async (req, res) => {
  try {
    res.render("pages/newUser", { title: "Sign Up" });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.use(async (req, res, next) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("pages/home", { title: "Home Page" });
  }
});

//DEV FOR LOGOUT
router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.render("pages/logout", { title: "Log Out" });
});

module.exports = router;
