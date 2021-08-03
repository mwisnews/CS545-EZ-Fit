const express = require("express");
const router = express.Router();

const trim = (str) => (str || "").trim();

router.get("/", async (req, res) => res.redirect("/login"));

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

router.get("/home", async (req, res) => {
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
router.post("/newUser", async (req, res) => {
  try{
    res.render("pages/home", { title: "Home Page"});
  } catch (e){
    console.log(e);
    res.sendStatus(500);
  }
});

//DEV FOR LOGOUT
router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.render("pages/logout", { title: "Log Out" });
});

router.use(async (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
});


module.exports = router;
