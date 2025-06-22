require("dotenv").config();
const mongoose = require("mongoose");
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

async function fixAcceptanceRates() {
  try {
    console.log("Fixing acceptance rates for all problems...");
    
    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems to fix`);

    let fixedCount = 0;

    for (const problem of problems) {
      const totalSubmissions = problem.totalSubmissions || 0;
      const successfulSubmissions = problem.successfulSubmissions || 0;
      
      let newAcceptance;
      if (totalSubmissions === 0) {
        newAcceptance = "0%";
      } else {
        const rate = (successfulSubmissions / totalSubmissions) * 100;
        newAcceptance = `${rate.toFixed(1)}%`;
      }
      
      const currentAcceptance = problem.acceptance || "0%";
      
      if (currentAcceptance !== newAcceptance) {
        console.log(`Fixing ${problem.title}:`);
        console.log(`  Current: ${currentAcceptance}`);
        console.log(`  Correct: ${newAcceptance}`);
        console.log(`  Stats: ${successfulSubmissions}/${totalSubmissions} successful`);
        
        // Update the problem - use .save() to trigger middleware
        problem.acceptance = newAcceptance;
        await problem.save();
        
        fixedCount++;
      } else {
        console.log(`✓ ${problem.title} already correct: ${currentAcceptance}`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} problems out of ${problems.length} total`);
    
    // Show final status
    console.log("\nFinal acceptance rates:");
    const updatedProblems = await Problem.find({}).select('title acceptance totalSubmissions successfulSubmissions').limit(10);
    updatedProblems.forEach(p => {
      console.log(`${p.title}: ${p.acceptance} (${p.successfulSubmissions || 0}/${p.totalSubmissions || 0})`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing acceptance rates:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the fix
fixAcceptanceRates();
