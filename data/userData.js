const mongoCollections = require("../config/mongoCollections");
const GoalData = require("../data/goalData");
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
async function createUser(
  firstName,
  lastName,
  age = null,
  weight = null,
  id = null
) {
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

  let newUser;
  if (id) {
    let cleanID = ObjectId(id);
    newUser = {
      _id: cleanID,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      age: cleanAge,
      weight: cleanWeight,
      currentGoal: "",
      pastGoals: [],
      pastActivities: [],
      lastLogin: new Date(),
      consecutiveDays: 1,
    };
  } else {
    newUser = {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      age: cleanAge,
      weight: cleanWeight,
      currentGoal: "",
      pastGoals: [],
      pastActivities: [],
      lastLogin: new Date(),
      consecutiveDays: 1,
    };
  }

  // Everything looks good, create the new user

  const userCollection = await Users;
  const insertInfo = await userCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) throw "Could not add new user.";

  const addedUser = await getUserByID(insertInfo.insertedId.toString());
  return addedUser;
}

// Date comparison helper function
function daysBetween(first, second) {
  // Copy date parts of the timestamps, discarding the time parts.
  var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

  // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

  // Round down.
  return Math.floor(days);
}

// New login function to increment consecutive Days if needed
// Input: User ID
// Output: Returns new user
async function newLogin(userID) {
  // Error check
  let cleanUser = checkStr(userID);
  try {
    userObj = ObjectId(cleanUser);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const userList = await userCollection.findOne({ _id: userObj });
  if (userList.length === 0) {
    throw `Error: User does not exist in newLogin!`;
  }
  // If today's date is 1 day greater than lastLogin, increment consecutiveDays
  // and set the new lastLogin
  const lastLogin = userList.lastLogin;
  let updateStatus;
  const dayDifference = daysBetween(lastLogin, new Date());
  if (dayDifference >= 1 && dayDifference < 2) {
    updateStatus = await userCollection.updateOne(
      { _id: userObj },
      { $set: { lastLogin: new Date() }, $inc: { consecutiveDays: 1 } }
    );
  }
  // If today's login is not the day after, reset consecutiveDays to 1
  else if (dayDifference >= 2) {
    updateStatus = await userCollection.updateOne(
      { _id: userObj },
      { $set: { lastLogin: new Date() }, $set: { consecutiveDays: 1 } }
    );
  }
  return getUserByID(userID);
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
  const userList = await userCollection.findOne({ _id: userObj });
  if (userList.length === 0) {
    throw `Error: User does not exist in setNewGoal!`;
  }
  const goalList = await goalCollection.findOne({ _id: goalObj });
  if (goalList.length === 0) {
    throw `Error: Goal does not exist in setNewGoal!`;
  }

  // Everything looks good, add the current goal to past goal array and set new goal
  let currGoal = userList.currentGoal;
  let updateStatus;
  if (currGoal) {
    updateStatus = await userCollection.updateOne(
      { _id: userObj },
      { $push: { pastGoals: currGoal }, $set: { currentGoal: cleanGoal } }
    );
  } else {
    updateStatus = await userCollection.updateOne(
      { _id: userObj },
      { $set: { currentGoal: cleanGoal } }
    );
  }
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
    userObj = ObjectId(cleanUser);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const userList = await userCollection.findOne({ _id: userObj });
  if (userList.length === 0) {
    throw `Error: User does not exist in addNewActivity!`;
  }
  // Activity should be like [ [ Date, Goal ID, [Execise Type, Exercise Amount], Comments, Achievement ], ... ]
  if (!activity || !Array.isArray(activity)) {
    throw `Error: activity is invalid in addNewActivity`;
  }
  if (isNaN(Date.parse(activity[0]))) {
    throw `Error: activity has non-date as key in addNewActivity!`;
  }
  activity[0] = new Date(activity[0]);
  for (let i = 0; i < activity.length; i++) {
    if (!activity[i]) {
      throw `Error: activity array is invalid in addNewActivity!`;
    }
  }

  // Populate the activity with if it hit a milestone or not
  // Get the goal it is attached to
  const goalID = activity[1];
  const goalObj = ObjectId(goalID);
  const goalCollection = await Goals;
  const goalInfo = await goalCollection.findOne({ _id: goalObj });
  console.log(goalInfo);

  // Find the milestones
  const milestones = goalInfo.milestones;
  console.log(milestones);

  // Check if the new activity hit a milestone, if it did, mark the milestone to true
  let achievementFound = false;
  for (let i = 0; i < milestones.length; i++) {
    const currMilestone = milestones[i];
    const milestoneType = currMilestone["value"][0];
    const milestoneTarget = currMilestone["value"][1];
    const milestoneHit = currMilestone["completed"];
    const activityType = activity[2][0];
    const activityNumber = activity[2][1];
    // Compare the same activity exercise with milestone exercise's milestone which has not been reached yet
    if (milestoneType === activityType && !milestoneHit) {
      // If the activity is greater than a milestone, mark it as an achievement
      if (activityNumber >= milestoneTarget) {
        if (!achievementFound) {
          activity.push(true);
        }
        achievementFound = true;
        // We also need to set the milestone to true in Goals collection
        await GoalData.hitMilestone(goalID, i);
      }
    }
  }
  if (!achievementFound) {
    activity.push(false);
  }

  // Everything looks good, add the activity to the user
  const updateStatus = await userCollection.updateOne(
    { _id: userObj },
    { $push: { pastActivities: activity } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getUserByID(cleanUser);
}

// Remove activity function
// Input: User ID, activity information
// Output: Returns user ID with inputted activity removed
async function removeActivity(userID, activity) {
  // Error check
  let cleanUser = checkStr(userID);
  let userObj;
  try {
    userObj = ObjectId(cleanUser);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const userList = await userCollection.findOne({ _id: userObj });
  if (userList.length === 0) {
    throw `Error: User does not exist in removeActivity!`;
  }
  // Activity should be like [ [ Date, Goal ID, [Execise Type, Exercise Amount], Comments ], ... ]
  if (!activity) {
    throw `Error: activity is invalid in removeActivity`;
  }
  if (isNaN(Date.parse(activity[0]))) {
    throw `Error: activity has non-date as key in removeActivity!`;
  }
  activity[0] = new Date(activity[0]);
  for (let i = 0; i < activity.length; i++) {
    if (!activity[i] && activity[i] !== false) {
      throw `Error: activity array is invalid in removeActivity!`;
    }
  }

  // Everything looks good, add the activity to the user
  const updateStatus = await userCollection.updateOne(
    { _id: userObj },
    { $pull: { pastActivities: activity } }
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
  updateObj.pastActivities = userToBeUpdated.pastActivities;

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
  const deleteInfo = await userCollection.deleteOne({
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
  removeActivity,
  updateUser,
  deleteUser,
  newLogin,
};
