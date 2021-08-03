const loginRoutes = require("./login");

const userRoutes = require("./users");

const goalsRoutes = require("./goals");


const constructorMethod = (app) => {
  app.use("/goals", goalsRoutes);
  app.use("/users", userRoutes);
  app.use("/", loginRoutes);

  app.use("*", (req, res) => {
    res.status(404).render("pages/404", { message: "Not found" });
  });
};

module.exports = constructorMethod;
