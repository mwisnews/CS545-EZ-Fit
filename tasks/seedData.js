const connection = require("../config/mongoConnection");
let { ObjectId } = require("mongodb");
const users = require("../data/userData");
const exercises = require("../data/exerciseData");
const goals = require("../data/goalData");

const main = async () => {
  const db = await connection.createConnection();
  try {
    await db.dropDatabase();
  } catch (e) {}
  // Start seeding
  // Create user Max
  const max = await users.createUser(
    "Max",
    "Williams",
    25,
    195,
    "60f82057e2ef2a7dc3fd5a62"
  );
  console.log(max);

  // Get users
  console.log(await users.getAllUsers());
  console.log(await users.getUserByID(max._id.toString()));

  // Edit Max with a new last name and age
  console.log(
    await users.updateUser(max._id.toString(), { lastName: "William", age: 26 })
  );

  // Test delete
  // console.log(await users.deleteUser(max._id.toString()));

  // Add the basic exercises first
  cardioArray = [];
  for (let i = 0; i < 52; i++) {
    cardioArray.push(i / 2);
  }
  cardioExercise = await exercises.createExercise("Cardio", cardioArray);
  console.log(cardioExercise);

  liftingArray = [
    "Bench Press",
    "Shoulder Press",
    "Deadlift",
    "Barbell Squats",
    "Dumbbell Curls",
  ];
  liftingExercise = await exercises.createExercise(
    "Weight lifting",
    liftingArray
  );
  console.log(liftingExercise);
  console.log(
    await exercises.addNewRecommendation(
      liftingExercise._id.toString(),
      "Dumbbell Fly"
    )
  );
  console.log(
    await exercises.updateExercise(liftingExercise._id.toString(), {
      description: "Weightlifting",
    })
  );

  // Get all exercises
  console.log(await exercises.getAllExercises());
  console.log(await exercises.getExerciseByID(liftingExercise._id.toString()));

  // Test delete
  // console.log(await exercises.deleteExercise(liftingExercise._id.toString()));

  // Create a few goals for Max
  maxID = max._id.toString();
  const goal1 = await goals.createGoal(
    maxID,
    "Cardio",
    "Training for a 5K",
    3.1,
    "7/1/2021",
    "7/15/2021",
    true,
    [1, 1.5, 2, 2.5, 3]
  );
  console.log(goal1);

  const goal2 = await goals.createGoal(
    maxID,
    "Weightlifting",
    "Upper body strength training",
    135,
    "7/15/2021",
    "8/31/2021",
    false,
    [80, 90, 100, 110, 120, 135]
  );
  console.log(goal2);

  // Edit goals
  console.log(await goals.addNewMilestone(goal2._id.toString(), 130));
  console.log(
    await goals.updateGoal(goal2._id.toString(), {
      description: "Upper body strength training through bench press",
    })
  );

  // Get all goals
  console.log(await goals.getAllGoals());
  console.log(await goals.getGoalByID(goal1._id.toString()));
  console.log(await goals.getGoalByUser(maxID));

  // Test delete goal
  // console.log(await goals.deleteGoal(goal1._id.toString()));

  // Add goals to Max
  console.log(await users.setNewGoal(maxID, goal1._id.toString()));
  console.log(await users.setNewGoal(maxID, goal2._id.toString()));

  // Add activities to Max
  // Activity should be like { Date: [ Goal ID, Exercise Amount, Comments ], ... }
  console.log(
    await users.addNewActivity(maxID, {
      "7/15/2021": [goal2._id.toString(), 75, "Started bench press"],
    })
  );
  console.log(
    await users.addNewActivity(maxID, {
      "7/16/2021": [goal2._id.toString(), 80, "Hit first milestone :)"],
    })
  );
  console.log(
    await users.addNewActivity(maxID, {
      "7/18/2021": [goal2._id.toString(), 90, "Hit second milestone :)"],
    })
  );
  console.log(
    await users.addNewActivity(maxID, {
      "7/19/2021": [goal2._id.toString(), 80, "Not the best lifting day :("],
    })
  );

  console.log("Done seeding collections for EZ-Fit");
  await connection.closeConnection(db);
};

main().catch(console.log);
