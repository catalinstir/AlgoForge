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

// Test runner templates for known problems
const testRunnerTemplates = {
  "Two Sum": `
int main() {
    // Create test input for Two Sum problem
    std::vector<int> nums {{nums}};
    int target = {{target}};
    
    // Create solution instance and call the function
    Solution solution;
    std::vector<int> result = solution.twoSum(nums, target);
    
    // Print result
    std::cout << vectorToString(result) << std::endl;
    
    return 0;
}`,

  "Palindrome Number": `
int main() {
    // Create test input for Palindrome Number problem
    int x = {{x}};
    
    // Create solution instance and call the function
    Solution solution;
    bool result = solution.isPalindrome(x);
    
    // Print result
    std::cout << (result ? "true" : "false") << std::endl;
    
    return 0;
}`,
};

async function addCppTestRunners() {
  try {
    // Find all problems
    const problems = await Problem.find();

    console.log(`Found ${problems.length} problems`);

    let updatedCount = 0;

    for (const problem of problems) {
      // Check if we have a template for this problem title
      if (testRunnerTemplates[problem.title]) {
        problem.cppTestRunner = testRunnerTemplates[problem.title];
        await problem.save();
        updatedCount++;

        console.log(`Added C++ test runner for problem: ${problem.title}`);
      }
    }

    console.log(`Added ${updatedCount} C++ test runners`);
    console.log("Database update completed successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error adding C++ test runners:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the update function
addCppTestRunners();
