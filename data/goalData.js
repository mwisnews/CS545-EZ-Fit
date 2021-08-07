const mongoCollections = require("../config/mongoCollections");
const Users = mongoCollections.Users;
const Exercises = mongoCollections.Exercises;
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

// Get all goals function
// Input: None
// Output: List of all goals
async function getAllGoals() {
  const goalCollection = await Goals;
  const goalList = await goalCollection.find({}).toArray();
  return goalList;
}

// Get goal by ID function
// Input: goalID
// Output: Goal information
async function getGoalByID(goalID) {
  // Error check the id
  let cleanID = checkStr(goalID);
  let cleanObjID;
  try {
    cleanObjID = ObjectId(cleanID);
  } catch (e) {
    throw e;
  }
  // Get user information
  const goalCollection = await Goals;
  const goalList = await goalCollection.find({ _id: cleanObjID }).toArray();
  if (goalList.length === 0) {
    throw `Error: Goal ${goalID} not found in EZ-Fit`;
  }
  return goalList[0];
}

// Get goal by user function
// Input: userID
// Output: List of goals that belong to a user
async function getGoalByUser(userID) {
  // Error check the id
  let cleanID = checkStr(userID);
  let cleanObjID;
  try {
    cleanObjID = ObjectId(cleanID);
  } catch (e) {
    throw e;
  }
  const userCollection = await Users;
  const userList = await userCollection.find({ _id: cleanObjID }).toArray();
  if (userList.length === 0) {
    throw `Error: User ${userID} not found in getGoalByUser!`;
  }
  // Get goals by inputted user
  const goalCollection = await Goals;
  const goalList = await goalCollection.find({ userID: userID }).toArray();
  return goalList;
}

// Create goal function
// Input: All attributes of a goal
// Output: Returns goal object that was created
async function createGoal(
  userID,
  exerciseType,
  description,
  target,
  startDate,
  endDate,
  completed,
  milestones
) {
  // Error checking
  if (
    !userID ||
    !exerciseType ||
    !description ||
    !target ||
    !startDate ||
    !endDate ||
    !milestones
  ) {
    throw `Error: Not all attributes inputted in createGoal!`;
  }
  // Basic checking and cleaning
  let cleanUser = checkStr(userID);
  let cleanExercise = checkStr(exerciseType);
  let cleanDescription = checkStr(description);
  let cleanTarget = target;
  let cleanStart = Date.parse(startDate);
  let cleanEnd = Date.parse(endDate);
  let cleanMilestones = [];

  // Populate each milestone as not achieved
  for (let i = 0; i < milestones.length; i++) {
    cleanMilestones.push([milestones[i], false]);
  }

  // Check target is valid
  if (!Array.isArray(cleanTarget)) {
    throw `Error: Invalid target inputted in createGoal!`;
  }
  // Check milestones are valid
  if (!Array.isArray(cleanMilestones)) {
    throw `Error: Invalid milestones inputted in createGoal!`;
  }
  // Check dates are valid
  if (isNaN(cleanStart) || isNaN(cleanEnd)) {
    throw `Error: Invalid start/end dates inputted in createGoal!`;
  }
  cleanStart = new Date(cleanStart);
  cleanEnd = new Date(cleanEnd);
  // Check user exists
  const userCollection = await Users;
  const userList = await userCollection
    .find({ _id: ObjectId(cleanUser) })
    .toArray();
  if (userList.length === 0) {
    throw `Error: User ${userID} not found in createGoal!`;
  }
  // Check exercise type exists
  const exerciseCollection = await Exercises;
  const exerciseList = await exerciseCollection
    .find({ description: cleanExercise })
    .toArray();
  if (exerciseList.length === 0) {
    throw `Error: Exercise ${cleanExercise} not found in createGoal!`;
  }

  // Everything looks good, create the new exercise
  let newGoal = {
    userID: cleanUser,
    exerciseType: cleanExercise,
    description: cleanDescription,
    target: cleanTarget,
    startDate: cleanStart,
    endDate: cleanEnd,
    completed: completed,
    milestones: cleanMilestones,
  };
  const goalCollection = await Goals;
  const insertInfo = await goalCollection.insertOne(newGoal);
  if (insertInfo.insertedCount === 0) throw "Could not add new goal.";

  const addedGoal = await getGoalByID(insertInfo.insertedId.toString());
  return addedGoal;
}

// Add new milestone function
// Input: Goal ID, new milestone
// Output: Returns goal object with new milestone
async function addNewMilestone(goalID, milestone) {
  // Error check
  let cleanGoal = checkStr(goalID);
  let goalObj;
  try {
    goalObj = ObjectId(cleanGoal);
  } catch (e) {
    throw e;
  }
  const goalCollection = await Goals;
  const goalList = await goalCollection.findOne({ _id: goalObj });
  if (goalList.length === 0) {
    throw `Error: goalList does not exist in addNewMilestone!`;
  }
  // Check milestone
  let cleanMilestone = [milestone, false];
  if (!Array.isArray(cleanMilestone)) {
    throw `Error: milestone is not an array in addNewMilestone!`;
  }

  // Everything looks good, add the activity to the user
  const updateStatus = await goalCollection.updateOne(
    { _id: goalObj },
    { $push: { milestones: cleanMilestone } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getGoalByID(cleanGoal);
}

// Hit milestone function
// Input: Goal ID, milestone to set to true
// Output: Returns goal object with updated milestones
async function hitMilestone(goalID, milestone) {
  // Error check
  let cleanGoal = checkStr(goalID);
  let goalObj;
  try {
    goalObj = ObjectId(cleanGoal);
  } catch (e) {
    throw e;
  }
  const goalCollection = await Goals;
  const goalList = await goalCollection.findOne({ _id: goalObj });
  if (goalList.length === 0) {
    throw `Error: goalList does not exist in removeMilestone!`;
  }
  // Check milestone
  let cleanMilestone = milestone;
  if (!Array.isArray(cleanMilestone)) {
    throw `Error: milestone is not an array in removeMilestone!`;
  }

  // Everything looks good, get the old milestones and reset it with a true value
  let updatedMilestones = goalList.milestones;
  for (let i = 0; i < updatedMilestones.length; i++) {
    let currMilestone = updatedMilestones[i];
    if (currMilestone[0].toString() === cleanMilestone[0].toString()) {
      updatedMilestones[i][1] = true;
      console.log(updatedMilestones);
      break;
    }
  }

  // Set the new milestone array
  const updateStatus = await goalCollection.updateOne(
    { _id: goalObj },
    { $set: { milestones: updatedMilestones } }
  );

  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getGoalByID(cleanGoal);
}

// Remove milestone function
// Input: Goal ID, milestone to delete
// Output: Returns goal object with updated milestones
async function removeMilestone(goalID, milestone) {
  // Error check
  let cleanGoal = checkStr(goalID);
  let goalObj;
  try {
    goalObj = ObjectId(cleanGoal);
  } catch (e) {
    throw e;
  }
  const goalCollection = await Goals;
  const goalList = await goalCollection.findOne({ _id: goalObj });
  if (goalList.length === 0) {
    throw `Error: goalList does not exist in removeMilestone!`;
  }
  // Check milestone
  let cleanMilestone = milestone;
  if (!Array.isArray(cleanMilestone)) {
    throw `Error: milestone is not an array in removeMilestone!`;
  }

  // Everything looks good, add the activity to the user
  const updateStatus = await goalCollection.updateOne(
    { _id: goalObj },
    { $pull: { milestones: cleanMilestone } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getGoalByID(cleanGoal);
}

// Update goal function. NOTE: Cannot set milestones or change the UserID
// Input: Goal ID, updated information
// Output: Goal object with updates
async function updateGoal(goalID, updatedGoal) {
  const goalCollection = await Goals;
  const goalToBeUpdated = await getGoalByID(goalID);
  if (!goalToBeUpdated) {
    throw `Error: Goal not found in updateGoal!`;
  }
  let updateObj = {};
  if (
    updatedGoal.exerciseType &&
    updatedGoal.exerciseType !== goalToBeUpdated.exerciseType
  ) {
    updateObj.exerciseType = updatedGoal.exerciseType;
  }

  if (
    updatedGoal.description &&
    updatedGoal.description !== goalToBeUpdated.description
  ) {
    updateObj.description = checkStr(updatedGoal.description);
  }

  if (updatedGoal.target && updatedGoal.target !== goalToBeUpdated.target) {
    if (!Array.isArray(updatedGoal.target)) {
      throw `Error: Passed invalid target to updateGoal, must be an Array!`;
    }
    updateObj.target = updatedGoal.target;
  }

  if (
    updatedGoal.startDate &&
    updatedGoal.startDate !== goalToBeUpdated.startDate
  ) {
    if (isNaN(Date.parse(updatedGoal.startDate))) {
      throw `Error: Passed invalid start date to updateGoal!`;
    }
    updateObj.startDate = new Date(updatedGoal.startDate);
  }

  if (updatedGoal.endDate && updatedGoal.endDate !== goalToBeUpdated.endDate) {
    if (isNaN(Date.parse(updatedGoal.endDate))) {
      throw `Error: Passed invalid start date to updateGoal!`;
    }
    updateObj.endDate = new Date(updatedGoal.endDate);
  }

  if (
    updatedGoal.completed &&
    updatedGoal.completed !== goalToBeUpdated.completed
  ) {
    updateObj.completed = updatedGoal.completed;
  }

  const goalInfo = await goalCollection.updateOne(
    { _id: ObjectId(goalID) },
    { $set: updateObj }
  );

  if (!goalInfo.matchedCount && !goalInfo.modifiedCount) {
    throw "Could not update goal";
  }

  return await getGoalByID(goalID);
}

// Remove goal function
// Input: Goal ID
// Output: Object of {GoalID, deleted: true} or throws
async function deleteGoal(goalID) {
  let cleanGoal = checkStr(goalID);
  const goalCollection = await Goals;
  const foundGoal = await getGoalByID(cleanGoal);
  if (!foundGoal) {
    throw `Error: Goal not found in deleteGoal!`;
  }
  // Everything looks good let's remove the post
  const deleteInfo = await goalCollection.deleteOne({
    _id: ObjectId(cleanGoal),
  });
  if (deleteInfo.deletedCount === 0) {
    throw `Error, could not delete goal with id ${cleanGoal}`;
  }
  const returnInfo = { goalID: cleanGoal, deleted: true };
  return returnInfo;
}

module.exports = {
  getAllGoals,
  getGoalByID,
  getGoalByUser,
  createGoal,
  addNewMilestone,
  removeMilestone,
  hitMilestone,
  updateGoal,
  deleteGoal,
};
