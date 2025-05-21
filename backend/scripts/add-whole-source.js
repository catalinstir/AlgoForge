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

// Template for Two Sum whole source
const twoSumTemplate = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <unordered_map>
#include <fstream>

// Helper function to print vectors for debugging
template <typename T>
std::string vectorToString(const std::vector<T>& vec) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) ss << ",";
        ss << vec[i];
    }
    ss << "]";
    return ss.str();
}

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // REPLACE WITH USER CODE
        // Use a hash map to store values and their indices
        std::unordered_map<int, int> numMap;
        
        for (int i = 0; i < nums.size(); i++) {
            // Calculate the complement needed to reach the target
            int complement = target - nums[i];
            
            // Check if complement exists in the map
            if (numMap.find(complement) != numMap.end()) {
                // Return the indices of the two numbers
                return {numMap[complement], i};
            }
            
            // Store current number and its index
            numMap[nums[i]] = i;
        }
        
        // No solution found
        return {};
    }
};

int main() {
    // Read input data from file
    std::ifstream inputFile("input.txt");
    if (!inputFile.is_open()) {
        std::cerr << "Failed to open input file" << std::endl;
        return 1;
    }

    // Parse input parameters
    std::unordered_map<std::string, std::string> params;
    std::string line;
    while (std::getline(inputFile, line)) {
        size_t delimiterPos = line.find("=");
        if (delimiterPos != std::string::npos) {
            std::string key = line.substr(0, delimiterPos);
            std::string value = line.substr(delimiterPos + 1);
            
            // Trim whitespace
            key.erase(0, key.find_first_not_of(" \\t"));
            key.erase(key.find_last_not_of(" \\t") + 1);
            value.erase(0, value.find_first_not_of(" \\t"));
            value.erase(value.find_last_not_of(" \\t") + 1);
            
            params[key] = value;
        }
    }
    inputFile.close();

    // Process input for Two Sum problem
    std::string numsStr = params["nums"];
    int target = std::stoi(params["target"]);
    
    // Parse nums vector - handle brackets correctly
    std::vector<int> nums;
    size_t startPos = numsStr.find('[');
    size_t endPos = numsStr.find(']');
    
    if (startPos != std::string::npos && endPos != std::string::npos) {
        numsStr = numsStr.substr(startPos + 1, endPos - startPos - 1);
        std::stringstream ss(numsStr);
        std::string item;
        while (std::getline(ss, item, ',')) {
            // Trim whitespace
            item.erase(0, item.find_first_not_of(" \\t"));
            item.erase(item.find_last_not_of(" \\t") + 1);
            if (!item.empty()) {
                nums.push_back(std::stoi(item));
            }
        }
    }
    
    // Create solution instance
    Solution solution;
    std::vector<int> result = solution.twoSum(nums, target);
    
    // Output result
    std::cout << vectorToString(result) << std::endl;
    
    return 0;
}`;

// Template for isPalindrome whole source
const isPalindromeTemplate = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <fstream>
#include <unordered_map>

// Function to convert bool to string
std::string boolToString(bool value) {
    return value ? "true" : "false";
}

class Solution {
public:
    bool isPalindrome(int x) {
        // REPLACE WITH USER CODE
        if (x < 0) return false;
        if (x < 10) return true;
        
        long long reversed = 0;
        long long original = x;
        
        while (x > 0) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        
        return original == reversed;
    }
};

int main() {
    // Read input data from file
    std::ifstream inputFile("input.txt");
    if (!inputFile.is_open()) {
        std::cerr << "Failed to open input file" << std::endl;
        return 1;
    }

    // Parse input parameters
    std::unordered_map<std::string, std::string> params;
    std::string line;
    while (std::getline(inputFile, line)) {
        size_t delimiterPos = line.find("=");
        if (delimiterPos != std::string::npos) {
            std::string key = line.substr(0, delimiterPos);
            std::string value = line.substr(delimiterPos + 1);
            
            // Trim whitespace
            key.erase(0, key.find_first_not_of(" \\t"));
            key.erase(key.find_last_not_of(" \\t") + 1);
            value.erase(0, value.find_first_not_of(" \\t"));
            value.erase(value.find_last_not_of(" \\t") + 1);
            
            params[key] = value;
        }
    }
    inputFile.close();

    // Process input for isPalindrome problem
    int x = std::stoi(params["x"]);
    
    // Create solution instance
    Solution solution;
    bool result = solution.isPalindrome(x);
    
    // Output result
    std::cout << boolToString(result) << std::endl;
    
    return 0;
}`;

// Map of function names to template implementations
const templateMap = {
  "twoSum": twoSumTemplate,
  "isPalindrome": isPalindromeTemplate,
  // Add more templates here as needed
};

// Generic template for functions not explicitly defined
function generateGenericTemplate(functionName) {
  return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <unordered_map>
#include <fstream>

// Helper function to print vectors for debugging
template <typename T>
std::string vectorToString(const std::vector<T>& vec) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) ss << ",";
        ss << vec[i];
    }
    ss << "]";
    return ss.str();
}

// Helper function for bool output
std::string boolToString(bool value) {
    return value ? "true" : "false";
}

class Solution {
public:
    // REPLACE WITH USER SOLUTION CODE
    // This is a placeholder that will be replaced with the user's implementation
};

int main() {
    // Read input data from file
    std::ifstream inputFile("input.txt");
    if (!inputFile.is_open()) {
        std::cerr << "Failed to open input file" << std::endl;
        return 1;
    }

    // Parse input parameters
    std::unordered_map<std::string, std::string> params;
    std::string line;
    while (std::getline(inputFile, line)) {
        size_t delimiterPos = line.find("=");
        if (delimiterPos != std::string::npos) {
            std::string key = line.substr(0, delimiterPos);
            std::string value = line.substr(delimiterPos + 1);
            
            // Trim whitespace
            key.erase(0, key.find_first_not_of(" \\t"));
            key.erase(key.find_last_not_of(" \\t") + 1);
            value.erase(0, value.find_first_not_of(" \\t"));
            value.erase(value.find_last_not_of(" \\t") + 1);
            
            params[key] = value;
        }
    }
    inputFile.close();

    // IMPORTANT: This main function is a placeholder.
    // You must implement proper parsing and function calling for your specific problem.
    std::cerr << "Generic template used for function: ${functionName}" << std::endl;
    std::cerr << "Please create a specific template for this function type." << std::endl;
    
    return 1;
}`;
}

async function addWholeSourceToProblems() {
  try {
    // Find all problems
    const problems = await Problem.find();
    console.log(`Found ${problems.length} problems to process`);
    
    let updatedProblems = 0;
    
    for (const problem of problems) {
      // Skip if wholeSource already exists
      if (problem.wholeSource && problem.wholeSource.cpp) {
        console.log(`Problem ${problem.title} already has wholeSource.cpp`);
        continue;
      }
      
      // Get the template based on function name
      let template = templateMap[problem.functionName];
      
      // If no specific template exists, use the generic one
      if (!template) {
        console.log(`No specific template for ${problem.functionName}, using generic template`);
        template = generateGenericTemplate(problem.functionName);
      }
      
      // Set the wholeSource field
      if (!problem.wholeSource) {
        problem.wholeSource = {};
      }
      
      problem.wholeSource.cpp = template;
      
      // Save the problem
      await problem.save();
      updatedProblems++;
      console.log(`Updated problem: ${problem.title}`);
    }
    
    console.log(`Migration complete: Added wholeSource to ${updatedProblems} problems`);
    
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
addWholeSourceToProblems();
