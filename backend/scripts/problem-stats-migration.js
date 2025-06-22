require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
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

async function migrateProblemStats() {
  try {
    console.log("Starting problem statistics migration...");
    
    // Get all problems
    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems to update`);

    let updatedCount = 0;

    for (const problem of problems) {
      console.log(`Processing problem: ${problem.title}`);
      
      // Initialize stats if they don't exist
      const updateData = {};
      let needsUpdate = false;

      if (problem.totalSubmissions === undefined) {
        updateData.totalSubmissions = 0;
        needsUpdate = true;
      }
      
      if (problem.successfulSubmissions === undefined) {
        updateData.successfulSubmissions = 0;
        needsUpdate = true;
      }
      
      if (problem.uniqueAttempts === undefined) {
        updateData.uniqueAttempts = 0;
        needsUpdate = true;
      }
      
      if (problem.uniqueSolvers === undefined) {
        updateData.uniqueSolvers = 0;
        needsUpdate = true;
      }

      // Calculate actual statistics from existing submissions
      const submissions = await Submission.find({ problem: problem._id });
      
      if (submissions.length > 0) {
        // Total submissions
        updateData.totalSubmissions = submissions.length;
        
        // Successful submissions (Accepted status)
        updateData.successfulSubmissions = submissions.filter(
          sub => sub.status === "Accepted"
        ).length;
        
        // Unique attempts (unique users who submitted)
        const uniqueUsers = new Set(submissions.map(sub => sub.user.toString()));
        updateData.uniqueAttempts = uniqueUsers.size;
        
        // Unique solvers (unique users with at least one accepted submission)
        const acceptedSubmissions = submissions.filter(sub => sub.status === "Accepted");
        const uniqueSolvers = new Set(acceptedSubmissions.map(sub => sub.user.toString()));
        updateData.uniqueSolvers = uniqueSolvers.size;
        
        needsUpdate = true;
        
        console.log(`  - Total submissions: ${updateData.totalSubmissions}`);
        console.log(`  - Successful submissions: ${updateData.successfulSubmissions}`);
        console.log(`  - Unique attempts: ${updateData.uniqueAttempts}`);
        console.log(`  - Unique solvers: ${updateData.uniqueSolvers}`);
      } else {
        console.log(`  - No submissions found, initializing with zeros`);
      }

      if (needsUpdate) {
        await Problem.findByIdAndUpdate(problem._id, { $set: updateData });
        updatedCount++;
        console.log(`  ✓ Updated problem: ${problem.title}`);
      }
    }

    console.log(`\n✅ Migration completed. Updated ${updatedCount} problems.`);
    
    // Verify a few problems
    console.log("\nVerification - Sample problem stats:");
    const sampleProblems = await Problem.find({}).limit(3).select('title totalSubmissions successfulSubmissions uniqueAttempts uniqueSolvers acceptance');
    
    sampleProblems.forEach(problem => {
      console.log(`${problem.title}:`);
      console.log(`  - Total Submissions: ${problem.totalSubmissions}`);
      console.log(`  - Successful Submissions: ${problem.successfulSubmissions}`);
      console.log(`  - Unique Attempts: ${problem.uniqueAttempts}`);
      console.log(`  - Unique Solvers: ${problem.uniqueSolvers}`);
      console.log(`  - Acceptance Rate: ${problem.acceptance}`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
migrateProblemStats();
