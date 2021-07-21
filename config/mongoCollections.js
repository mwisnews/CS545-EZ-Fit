const mongodbConnection = require("./mongoConnection");

let _collection;

const getCollection = async (collection) => {
  try {
    const db = await mongodbConnection.getDB();
    if (!db) db = await mongodbConnection.createConnection();
    _collection = await db.collection(collection);
  } catch (err) {
    throw err;
  }
  return _collection;
};

module.exports = {
  Users: getCollection("Users"),
  Exercises: getCollection("Exercises"),
  Goals: getCollection("Goals"),
};
