const MongoClient = require("mongodb").MongoClient;
const mongodbConfig = require("./settings.json").mongodbConfig;

let _connection;
let _db;

const createConnection = async () => {
  try {
    if (!_connection) {
      _connection = await MongoClient.connect(mongodbConfig.serverURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      _db = await _connection.db(mongodbConfig.database);
    }
  } catch (err) {
    throw err;
  }
  return _db;
};

const closeConnection = async (db) => {
  let isConnectionClosed = false;
  try {
    await db.serverConfig.close();
    isConnectionClosed = true;
  } catch (err) {
    throw err;
  }
  return isConnectionClosed;
};

const getDB = async () => {
  if (!_db) _db = await createConnection();
  return _db;
};

module.exports = {
  createConnection,
  closeConnection,
  getDB,
};
