const dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollection = async (collection) => {
  let _col = undefined;
  if (!_col) {
    const db = await dbConnection();
    _col = await db.collection(collection);
  }

  return _col;
};

module.exports = {
  Users: getCollection("Users"),
  Exercises: getCollection("Exercises"),
  Goals: getCollection("Goals"),
};
