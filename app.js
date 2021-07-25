const express = require("express");
const session = require("express-session");
const nocache = require("nocache");
const exphbs = require("express-handlebars");
const configRoutes = require("./routes");

const PORT = 3000;

const app = express();

app.use(nocache());
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(
  session({
    name: "AuthCookie",
    secret: "A secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("*", (req, res, next) => {
  if (!req.session.userID) {
    req.session.userID = "60f82057e2ef2a7dc3fd5a62";
    next();
  } else {
    next();
  }
});

configRoutes(app);

app.listen(PORT, () =>
  console.log(`Server listening for requests on port ${PORT}`)
);
