require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Problem = require("../models/Problem");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

async function addDifficultyTracking() {
  try {
    console.log("Adding difficulty tracking to existing users...");
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      // Add solvedByDifficulty field if it doesn't exist
      if (!user.solvedByDifficulty) {
        // Initialize with zeros
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
        
        // Count solved problems by difficulty
        if (user.problemsSolved && user.problemsSolved.length > 0) {
          console.log(`Calculating difficulty breakdown for user: ${user.username}`);
          
          for (const problemId of user.problemsSolved) {
            try {
              const problem = await Problem.findById(problemId).select('difficulty');
              if (problem && problem.difficulty) {
                difficultyCount[problem.difficulty]++;
              }
            } catch (err) {
              console.warn(`Could not find problem ${problemId} for user ${user.username}`);
            }
          }
        }
        
        updateData.solvedByDifficulty = difficultyCount;
        needsUpdate = true;
        
        console.log(`User ${user.username}: Easy=${difficultyCount.Easy}, Medium=${difficultyCount.Medium}, Hard=${difficultyCount.Hard}`);
      }

      // Ensure successRate is set
      if (user.successRate === undefined || user.successRate === null) {
        if (user.problemsAttempted && user.problemsAttempted.length > 0) {
          updateData.successRate = (user.problemsSolved.length / user.problemsAttempted.length) * 100;
        } else {
          updateData.successRate = 0;
        }
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { $set: updateData });
        updatedCount++;
        console.log(`✓ Updated user: ${user.username}`);
      }
    }

    console.log(`\n✅ Migration completed. Updated ${updatedCount} users.`);
    console.log("\nAdded features:");
    console.log("- solvedByDifficulty tracking for all users");
    console.log("- Proper successRate calculation");
    console.log("- Difficulty breakdown in user profiles");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
addDifficultyTracking();
