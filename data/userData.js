const mongoCollections = require("../config/mongoCollections");
const Users = mongoCollections.Users;
const Goals = mongoCollections.Goals;
let { ObjectId } = require("mongodb");

/*
    HELPER FUNCTIONS TO CHECK USER INPUT 
*/
// Check string function: is string and non empty
// Input: String
// Output: Trimmed/cleaned string
function checkStr(str, param) {
  if (!str) throw `Error: ${param} not provided`;
  if (typeof str !== "string") throw `Error: ${param} is not string`;
  if (str.length === 0) throw `Error: ${param} is empty string`;
  if (!str.trim().length === 0) throw `Error: ${param} is just empty spaces`;
  return str.trim();
}

/*
    BEGIN DATABASE FUNCTIONS
*/

// Get all users function
// Input: None
// Output: List of all users
async function getAllUsers() {
  const userCollection = await Users;
  const userList = await userCollection.find({}).toArray();
  return userList;
}

// Get user by ID function
// Input: userID
// Output: User information
async function getUserByID(userID) {
  // Error check the id
  let cleanID = checkStr(userID);
  let cleanObjID;
  try {
    cleanObjID = ObjectId(cleanID);
  } catch (e) {
    throw e;
  }
  // Get user information
  const userCollection = await Users;
  const userList = await userCollection.find({ _id: cleanObjID }).toArray();
  if (userList.length === 0) {
    throw `Error: User ${userID} not found in EZ-Fit`;
  }
  return userList[0];
}

// Create user function
// Input: All attributes of a user
// Output: Returns user ID that was created
async function createUser(firstName, lastName, age = null, weight = null) {
  // Error checking
  let cleanFirstName = checkStr(firstName);
  let cleanLastName = checkStr(lastName);
  let cleanAge, cleanWeight;
  if (age) {
    if (age <= 0 || age >= 100 || !Number.isInteger(parseInt(age))) {
      throw `Error: Age is not valid in createUser!`;
    }
    cleanAge = parseInt(age);
  } else {
    cleanAge = null;
  }
  if (weight) {
    if (weight <= 0) {
      throw `Error: Weight is not valid in createUser!`;
    }
    cleanWeight = parseFloat(weight);
  } else {
    cleanWeight = null;
  }

  // Everything looks good, create the new user
  let newUser = {
    firstName: cleanFirstName,
    lastName: cleanLastName,
    age: cleanAge,
    weight: cleanWeight,
    currentGoal: "",
    pastGoals: [],
    pastActivies: [],
  };

  const userCollection = await Users;
  const insertInfo = await userCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) throw "Could not add new user.";

  const addedUser = await getUserByID(insertInfo.insertedId.toString());
  return addedUser;
}

// Set new goal function
// Input: User ID, Goal ID
// Output: Returns user ID that added a new goal
async function setNewGoal(userID, goalID) {
  // Error check
  let cleanUser = checkStr(userID);
  let cleanGoal = checkStr(goalID);
  let userObj, goalObj;
  try {
    goalObj = ObjectId(cleanGoal);
    userObj = ObjectId(cleanUser);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const goalCollection = await Goals;
  const userList = await userCollection.findOne({ _id: userObj }).toArray();
  if (userList.length === 0) {
    throw `Error: User does not exist in setNewGoal!`;
  }
  const goalList = await goalCollection.findOne({ _id: goalObj }).toArray();
  if (goalList.length === 0) {
    throw `Error: Goal does not exist in setNewGoal!`;
  }

  // Everything looks good, add the current goal to past goal array and set new goal
  let currGoal = goalList[0].currentGoal;
  const updateStatus = await userCollection.updateOne(
    { _id: userObj },
    { $push: { pastGoals: currGoal }, $set: { currentGoal: cleanGoal } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getUserByID(cleanUser);
}

// Add new activity function
// Input: User ID, activity information
// Output: Returns user ID that added a new activity
async function addNewActivity(userID, activity) {
  // Error check
  let cleanUser = checkStr(userID);
  let userObj;
  try {
    goalObj = ObjectId(cleanGoal);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const userList = await userCollection.findOne({ _id: userObj }).toArray();
  if (userList.length === 0) {
    throw `Error: User does not exist in addNewActivity!`;
  }
  // Activity should be like { Date: [ Goal ID, Exercise Amount, Comments ], ... }
  if (!activity || typeof activity !== "object") {
    throw `Error: activity is invalid in addNewActivity`;
  }
  for (const [key, value] of Object.entries(activity)) {
    if (isNaN(Date.parse(key))) {
      throw `Error: activity has non-date as key in addNewActivity!`;
    }
    for (let i = 0; i < value.length; i++) {
      checkStr(value[i]);
    }
  }

  // Everything looks good, add the activity to the user
  const updateStatus = await userCollection.updateOne(
    { _id: userObj },
    { $push: { pastActivies: activity } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getUserByID(cleanUser);
}

// Update user function. NOTE: Cannot set current goal, past goals, or past activities
// Input: UserID, updated information
// Output: User object with updates
async function updateUser(userID, updatedUser) {
  const userCollection = await Users;
  const userToBeUpdated = await getUserByID(userID);
  if (!userToBeUpdated) {
    throw `Error: User not found in updateUser!`;
  }
  let updateObj = {};
  if (
    updatedUser.firstName &&
    updatedUser.firstName !== userToBeUpdated.firstName
  ) {
    updateObj.firstName = updatedUser.firstName;
  }

  if (
    updatedUser.lastName &&
    updatedUser.lastName !== userToBeUpdated.lastName
  ) {
    updateObj.lastName = updatedUser.lastName;
  }

  if (updatedUser.age && updatedUser.age !== userToBeUpdated.age) {
    updateObj.age = updatedUser.age;
  }

  if (updatedUser.weight && updatedUser.weight !== userToBeUpdated.weight) {
    updateObj.weight = updatedUser.weight;
  }

  // Copy over current goal, past goal, and past activities
  updateObj.currentGoal = userToBeUpdated.currentGoal;
  updateObj.pastGoals = userToBeUpdated.pastGoals;
  updateObj.pastActivies = userToBeUpdated.pastActivies;

  const userInfo = await userCollection.updateOne(
    { _id: ObjectId(userID) },
    { $set: updateObj }
  );

  if (!userInfo.matchedCount && !userInfo.modifiedCount) {
    throw "Could not update user";
  }

  return await getUserByID(userID);
}

// Remove user function
// Input: User ID
// Output: Object of {UserID, deleted: true} or throws
async function deleteUser(userID) {
  let cleanUser = checkStr(userID);
  const userCollection = await Users;
  const foundUser = await getUserByID(cleanUser);
  if (!foundUser) {
    throw `Error: User not found in updateUser!`;
  }
  // Everything looks good let's remove the post
  const deleteInfo = await userCollection.removeOne({
    _id: ObjectId(cleanUser),
  });
  if (deleteInfo.deletedCount === 0) {
    throw `Error, could not delete user with id ${cleanUser}`;
  }
  const returnInfo = { userID: cleanUser, deleted: true };
  return returnInfo;
}

module.exports = {
  getAllUsers,
  getUserByID,
  createUser,
  setNewGoal,
  addNewActivity,
  updateUser,
  deleteUser,
};
