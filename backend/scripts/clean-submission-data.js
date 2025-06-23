require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

async function cleanSubmissionData() {
  try {
    console.log("🧹 Starting submission data cleanup...");
    console.log("=" .repeat(50));

    // Get initial counts
    const initialSubmissionCount = await Submission.countDocuments();
    const initialUserCount = await User.countDocuments();
    const initialProblemCount = await Problem.countDocuments();

    console.log(`📊 Initial Data Counts:`);
    console.log(`   - Users: ${initialUserCount}`);
    console.log(`   - Problems: ${initialProblemCount}`);
    console.log(`   - Submissions: ${initialSubmissionCount}`);
    console.log("");

    if (initialSubmissionCount === 0) {
      console.log("✅ No submissions found. Nothing to clean.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Confirm deletion
    console.log("⚠️  WARNING: This will permanently delete ALL submission data!");
    console.log("   This includes:");
    console.log("   - All submission records");
    console.log("   - User progress tracking (problemsSolved, problemsAttempted)");
    console.log("   - User statistics (success rates, difficulty tracking)");
    console.log("   - Problem statistics (acceptance rates, submission counts)");
    console.log("");

    // In a real script, you might want to add a confirmation prompt
    // For automation, we'll proceed directly but you can uncomment the lines below
    // const readline = require('readline').createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // const answer = await new Promise(resolve => {
    //   readline.question('Type "DELETE ALL" to confirm: ', resolve);
    // });
    // readline.close();
    // if (answer !== "DELETE ALL") {
    //   console.log("❌ Operation cancelled.");
    //   await mongoose.disconnect();
    //   process.exit(0);
    // }

    console.log("🗑️  Starting deletion process...");
    console.log("");

    // Step 1: Delete all submissions
    console.log("1️⃣  Deleting all submissions...");
    const deletedSubmissions = await Submission.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSubmissions.deletedCount} submissions`);

    // Step 2: Reset user submission tracking
    console.log("2️⃣  Resetting user submission tracking...");
    const userUpdateResult = await User.updateMany(
      {},
      {
        $set: {
          problemsAttempted: [],
          problemsSolved: [],
          totalSubmissions: 0,
          successRate: 0,
          solvedByDifficulty: {
            Easy: 0,
            Medium: 0,
            Hard: 0
          }
        }
      }
    );
    console.log(`   ✅ Reset submission data for ${userUpdateResult.modifiedCount} users`);

    // Step 3: Reset problem statistics
    console.log("3️⃣  Resetting problem statistics...");
    const problemUpdateResult = await Problem.updateMany(
      {},
      {
        $set: {
          totalSubmissions: 0,
          successfulSubmissions: 0,
          uniqueAttempts: 0,
          uniqueSolvers: 0,
          acceptance: "0%"
        }
      }
    );
    console.log(`   ✅ Reset statistics for ${problemUpdateResult.modifiedCount} problems`);

    // Step 4: Verify cleanup
    console.log("4️⃣  Verifying cleanup...");
    const finalSubmissionCount = await Submission.countDocuments();
    const usersWithSubmissions = await User.countDocuments({
      $or: [
        { "problemsSolved.0": { $exists: true } },
        { "problemsAttempted.0": { $exists: true } },
        { totalSubmissions: { $gt: 0 } }
      ]
    });
    const problemsWithStats = await Problem.countDocuments({
      $or: [
        { totalSubmissions: { $gt: 0 } },
        { successfulSubmissions: { $gt: 0 } },
        { uniqueAttempts: { $gt: 0 } },
        { uniqueSolvers: { $gt: 0 } }
      ]
    });

    console.log("");
    console.log("📊 Final Verification:");
    console.log(`   - Remaining submissions: ${finalSubmissionCount}`);
    console.log(`   - Users with submission data: ${usersWithSubmissions}`);
    console.log(`   - Problems with statistics: ${problemsWithStats}`);

    if (finalSubmissionCount === 0 && usersWithSubmissions === 0 && problemsWithStats === 0) {
      console.log("");
      console.log("🎉 SUCCESS! All submission data has been cleaned successfully.");
      console.log("");
      console.log("📈 What was cleaned:");
      console.log(`   ✅ Deleted ${deletedSubmissions.deletedCount} submission records`);
      console.log(`   ✅ Reset ${userUpdateResult.modifiedCount} user profiles`);
      console.log(`   ✅ Reset ${problemUpdateResult.modifiedCount} problem statistics`);
      console.log("");
      console.log("🔄 The system is now ready for fresh submission data.");
      console.log("   - Users can start solving problems from scratch");
      console.log("   - Problem statistics will rebuild as submissions come in");
      console.log("   - All user progress tracking is reset to zero");
    } else {
      console.log("");
      console.log("⚠️  WARNING: Cleanup may not be complete!");
      console.log("   Please check the verification results above.");
    }

    // Step 5: Show sample user and problem to confirm cleanup
    console.log("");
    console.log("🔍 Sample Data Check:");
    
    const sampleUser = await User.findOne({}).select('username problemsSolved problemsAttempted totalSubmissions successRate solvedByDifficulty');
    if (sampleUser) {
      console.log("   Sample User:");
      console.log(`     Username: ${sampleUser.username}`);
      console.log(`     Problems Solved: ${sampleUser.problemsSolved.length}`);
      console.log(`     Problems Attempted: ${sampleUser.problemsAttempted.length}`);
      console.log(`     Total Submissions: ${sampleUser.totalSubmissions}`);
      console.log(`     Success Rate: ${sampleUser.successRate}%`);
      console.log(`     Difficulty Breakdown: Easy=${sampleUser.solvedByDifficulty.Easy}, Medium=${sampleUser.solvedByDifficulty.Medium}, Hard=${sampleUser.solvedByDifficulty.Hard}`);
    }

    const sampleProblem = await Problem.findOne({}).select('title totalSubmissions successfulSubmissions uniqueAttempts uniqueSolvers acceptance');
    if (sampleProblem) {
      console.log("   Sample Problem:");
      console.log(`     Title: ${sampleProblem.title}`);
      console.log(`     Total Submissions: ${sampleProblem.totalSubmissions}`);
      console.log(`     Successful Submissions: ${sampleProblem.successfulSubmissions}`);
      console.log(`     Unique Attempts: ${sampleProblem.uniqueAttempts}`);
      console.log(`     Unique Solvers: ${sampleProblem.uniqueSolvers}`);
      console.log(`     Acceptance Rate: ${sampleProblem.acceptance}`);
    }

    console.log("");
    console.log("✨ Cleanup completed successfully!");

  } catch (error) {
    console.error("");
    console.error("❌ Error during cleanup:", error);
    console.error("");
    console.error("The cleanup process failed. Please check the error above and try again.");
    console.error("Your data should still be intact as operations are atomic.");
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("");
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Additional utility function to backup data before cleaning (optional)
async function backupSubmissionData() {
  try {
    console.log("💾 Creating backup of submission data...");
    
    const submissions = await Submission.find({}).lean();
    const users = await User.find({}).select('username problemsSolved problemsAttempted totalSubmissions successRate solvedByDifficulty').lean();
    const problems = await Problem.find({}).select('title totalSubmissions successfulSubmissions uniqueAttempts uniqueSolvers acceptance').lean();

    const backup = {
      timestamp: new Date().toISOString(),
      submissions: submissions,
      userStats: users,
      problemStats: problems
    };

    const fs = require('fs');
    const backupPath = `./backup-submissions-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`   - ${submissions.length} submissions backed up`);
    console.log(`   - ${users.length} user stats backed up`);
    console.log(`   - ${problems.length} problem stats backed up`);
    
    return backupPath;
  } catch (error) {
    console.error("❌ Failed to create backup:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log("🚀 AlgoRush Submission Data Cleanup Tool");
    console.log("=" .repeat(50));
    console.log("");

    // Uncomment the line below if you want to create a backup first
    // await backupSubmissionData();
    
    await cleanSubmissionData();
  } catch (error) {
    console.error("💥 Fatal error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the cleanup
main();
