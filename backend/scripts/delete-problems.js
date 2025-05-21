// backend/scripts/delete-all-problems.js
require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const User = require("../models/User");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

async function deleteAllProblems() {
  try {
    console.log("Getting count of problems to delete...");
    const problemCount = await Problem.countDocuments();
    console.log(`Found ${problemCount} problems to delete`);
    
    // First, remove problem references from all users
    console.log("Removing problem references from users...");
    await User.updateMany(
      {},
      {
        $set: {
          problemsAttempted: [],
          problemsSolved: [],
          problemsUploaded: []
        }
      }
    );
    console.log("Successfully cleared problem references from users");
    
    // Then delete all problems
    console.log("Deleting all problems...");
    const result = await Problem.deleteMany({});
    console.log(`Deletion complete. Deleted ${result.deletedCount} problems.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("Error deleting problems:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the deletion
deleteAllProblems();
