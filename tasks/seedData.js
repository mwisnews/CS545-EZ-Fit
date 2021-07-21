const connection = require("../config/mongoConnection");
let { ObjectId } = require("mongodb");
const users = require("../data/userData");
const exercises = require("../data/exerciseData");
const goals = require("../data/goalData");

const main = async () => {
  const db = await connection();
  try {
    await db.dropDatabase();
  } catch (e) {}
  // Start seeding
  // Create user Max
  const max = await users.createUser("Max", "Williams", 25, 195);
  console.log(max);

  // Get users
  console.log(await users.getAllUsers());
  console.log(await users.getUserByID(max._id.toString()));

  // Edit Max with a new last name and age
  console.log(
    await users.updateUser(max._id.toString(), { lastName: "William", age: 26 })
  );

  // Add the basic exercises first
  cardioArray = [];
  for (let i = 0; i < 52; i++) {
    cardioArray.push(i / 2);
  }
  console.log(await exercises.createExercise("Cardio", cardioArray));

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

  console.log("Done seeding collections for EZ-Fit");
  await db.serverConfig.close();
};

main().catch(console.log);
