const mongoCollections = require("../config/mongoCollections");
const Exercises = mongoCollections.Exercises;
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

// Get all exercises function
// Input: None
// Output: List of all exercises
async function getAllExercises() {
  // Everything looks good, we can move on
  const exerciseCollection = await Exercises;
  const exerciseList = await exerciseCollection.find({}).toArray();
  return exerciseList;
}

// Get exercise by ID function
// Input: exerciseID
// Output: Exercise information
async function getExerciseByID(exerciseID) {
  // Error check the id
  let cleanID = checkStr(exerciseID);
  let cleanObjID;
  try {
    cleanObjID = ObjectId(cleanID);
  } catch (e) {
    throw e;
  }
  // Get exercise information
  const exerciseCollection = await Exercises;
  const exerciseList = await exerciseCollection
    .find({ _id: cleanObjID })
    .toArray();
  if (exerciseList.length === 0) {
    throw `Error: User ${exerciseID} not found in EZ-Fit`;
  }
  return exerciseList[0];
}

// Create exercise function
// Input: All attributes of an exercise
// Output: Returns exercise that was created
async function createExercise(description, recommendations) {
  // Error checking
  let cleanDescription = checkStr(description);
  if (!recommendations || !Array.isArray(recommendations)) {
    throw `Error: recommendations is invalid in createExercise!`;
  }

  // Everything looks good, create the new exercise
  let newExercise = {
    description: cleanDescription,
    recommendations: recommendations,
  };

  const exerciseCollection = await Exercises;
  const insertInfo = await exerciseCollection.insertOne(newExercise);
  if (insertInfo.insertedCount === 0) throw "Could not add new exercise.";

  const addedExercise = await getExerciseByID(insertInfo.insertedId.toString());
  return addedExercise;
}

// Add new recommendation function
// Input: Exercise ID, Recommendation
// Output: Returns exercise with new recommendation
async function addNewRecommendation(exerciseID, recommendation) {
  // Error check
  let cleanExercise = checkStr(exerciseID);
  let cleanRecommendation = checkStr(recommendation);
  let exerciseObj;
  try {
    exerciseObj = ObjectId(cleanExercise);
  } catch (e) {
    throw e;
  }
  const exerciseCollection = await Exercises;
  const exerciseList = await exerciseCollection.findOne({ _id: exerciseObj });
  if (exerciseList.length === 0) {
    throw `Error: Exercise does not exist in addNewRecommendation!`;
  }

  // Everything looks good, add the current goal to past goal array and set new goal
  const updateStatus = await exerciseCollection.updateOne(
    { _id: exerciseObj },
    { $push: { recommendations: cleanRecommendation } }
  );
  if (!updateStatus.matchedCount && !updateStatus.modifiedCount) {
    throw "Error, update failed";
  }

  return getExerciseByID(cleanExercise);
}

// Update exercise function.
// Input: ExerciseID, updated information
// Output: Exercise object with updates
async function updateExercise(exerciseID, updatedExercise) {
  const exerciseCollection = await Exercises;
  const exerciseToBeUpdataed = await getExerciseByID(exerciseID);
  if (!exerciseToBeUpdataed) {
    throw `Error: Exercise not found in updateExercise!`;
  }
  let updateObj = {};
  if (
    updatedExercise.description &&
    updatedExercise.description !== exerciseToBeUpdataed.description
  ) {
    updateObj.description = updatedExercise.description;
  }

  if (
    updatedExercise.recommendations &&
    updatedExercise.recommendations !== exerciseToBeUpdataed.recommendations
  ) {
    updateObj.recommendations = updatedExercise.recommendations;
  }

  const exerciseInfo = await exerciseCollection.updateOne(
    { _id: ObjectId(exerciseID) },
    { $set: updateObj }
  );

  if (!exerciseInfo.matchedCount && !exerciseInfo.modifiedCount) {
    throw "Could not update exercise";
  }

  return await getExerciseByID(exerciseID);
}

// Remove exercise function
// Input: Exercise ID
// Output: Object of {ExerciseID, deleted: true} or throws
async function deleteExercise(exerciseID) {
  let cleanExercise = checkStr(exerciseID);
  const exerciseCollection = await Exercises;
  const foundExercise = await getExerciseByID(cleanExercise);
  if (!foundExercise) {
    throw `Error: Exercise not found in deleteExercise!`;
  }
  // Everything looks good let's remove the post
  const deleteInfo = await exerciseCollection.deleteOne({
    _id: ObjectId(cleanExercise),
  });
  if (deleteInfo.deletedCount === 0) {
    throw `Error, could not delete exercise with id ${cleanExercise}`;
  }
  const returnInfo = { exerciseID: cleanExercise, deleted: true };
  return returnInfo;
}

module.exports = {
  getAllExercises,
  getExerciseByID,
  createExercise,
  addNewRecommendation,
  updateExercise,
  deleteExercise,
};
