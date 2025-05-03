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

async function updateCppTemplates() {
  try {
    // Find all problems with C++ templates
    const problems = await Problem.find({
      "codeTemplates.cpp": { $exists: true },
    });

    console.log(`Found ${problems.length} problems with C++ templates`);

    let updatedCount = 0;

    for (const problem of problems) {
      if (problem.codeTemplates.cpp) {
        const cppTemplate = problem.codeTemplates.cpp;

        // Check if it already has using namespace std
        if (!cppTemplate.includes("using namespace std")) {
          // Add the namespace line after the class definition start
          const updatedTemplate = cppTemplate.replace(
            "class Solution {",
            "// Include necessary headers\n#include <vector>\n#include <string>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {"
          );

          // Update the template
          problem.codeTemplates.cpp = updatedTemplate;
          await problem.save();
          updatedCount++;

          console.log(`Updated C++ template for problem: ${problem.title}`);
        }
      }
    }

    console.log(`Updated ${updatedCount} C++ templates`);
    console.log("Database update completed successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error updating C++ templates:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the update function
updateCppTemplates();
