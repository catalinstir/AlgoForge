require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Problem = require("../models/Problem");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";

async function quickFixDifficultyTracking() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    
    console.log("Quick fix: Adding solvedByDifficulty to all users...");
    
    // Update ALL users to have the solvedByDifficulty field with default values
    const result = await User.updateMany(
      { solvedByDifficulty: { $exists: false } }, // Users without the field
      { 
        $set: { 
          solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
          successRate: 0
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users with default difficulty tracking`);
    
    // Now let's calculate the actual values for users who have solved problems
    const users = await User.find({
      problemsSolved: { $exists: true, $not: { $size: 0 } }
    });
    
    console.log(`Found ${users.length} users with solved problems to recalculate`);
    
    for (const user of users) {
      if (user.problemsSolved && user.problemsSolved.length > 0) {
        console.log(`Calculating for user: ${user.username}`);
        
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
        
        // Get all solved problems and count by difficulty
        const problems = await Problem.find({
          _id: { $in: user.problemsSolved }
        }).select('difficulty');
        
        problems.forEach(problem => {
          if (problem.difficulty) {
            difficultyCount[problem.difficulty]++;
          }
        });
        
        // Calculate success rate
        const successRate = user.problemsAttempted && user.problemsAttempted.length > 0
          ? (user.problemsSolved.length / user.problemsAttempted.length) * 100
          : 0;
        
        // Update the user
        await User.findByIdAndUpdate(user._id, {
          $set: { 
            solvedByDifficulty: difficultyCount,
            successRate: successRate
          } 
        });
        
        console.log(`✓ ${user.username}: Easy=${difficultyCount.Easy}, Medium=${difficultyCount.Medium}, Hard=${difficultyCount.Hard}, Success=${successRate.toFixed(1)}%`);
      }
    }
    
    console.log("\n✅ Quick fix completed!");
    
    // Verify the fix
    const sampleUser = await User.findOne({}).select('username solvedByDifficulty successRate problemsSolved problemsAttempted');
    console.log("\nSample user structure:");
    console.log(JSON.stringify({
      username: sampleUser.username,
      solvedByDifficulty: sampleUser.solvedByDifficulty,
      successRate: sampleUser.successRate,
      problemsSolved: sampleUser.problemsSolved?.length || 0,
      problemsAttempted: sampleUser.problemsAttempted?.length || 0
    }, null, 2));
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
    
  } catch (error) {
    console.error("Error in quick fix:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

quickFixDifficultyTracking();
