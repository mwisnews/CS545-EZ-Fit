const mongodbConnection = require("./mongodbConnection");

const db = mongodbConnection.getDB();

let _collection;

const getCollection = async (collection) => {
  try {
    if (!db) db = mongodbConnection.createConnection();
    _collection = await db.collection(collection);
  } catch (err) {
    throw err;
  }
  return _collection;
};

module.exports = {
  Users: getCollection("Users")
};
