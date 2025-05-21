// backend/scripts/add-wholeSource-to-problems.js
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

async function addWholeSourceToProblems() {
  try {
    // Define the wholeSource data for Two Sum
    const twoSumWholeSource = {
      cpp: `#include <iostream>
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
            params[key] = value;
        }
    }
    inputFile.close();

    // Process input for Two Sum problem
    std::string numsStr = params["nums"];
    int target = std::stoi(params["target"]);
    
    // Parse nums vector
    std::vector<int> nums;
    numsStr = numsStr.substr(1, numsStr.size() - 2); // Remove { }
    std::stringstream ss(numsStr);
    std::string item;
    while (std::getline(ss, item, ',')) {
        nums.push_back(std::stoi(item));
    }
    
    // Create solution instance
    Solution solution;
    std::vector<int> result = solution.twoSum(nums, target);
    
    // Output result
    std::cout << vectorToString(result) << std::endl;
    
    return 0;
}`,
      python: `# Two Sum Problem 

class Solution:
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        # Use a dictionary to store values and their indices
        num_map = {}
        
        for i, num in enumerate(nums):
            # Calculate the complement needed to reach the target
            complement = target - num
            
            # Check if complement exists in the map
            if complement in num_map:
                # Return the indices of the two numbers
                return [num_map[complement], i]
            
            # Store current number and its index
            num_map[num] = i
        
        # No solution found
        return []

def main():
    # Read input data from file
    with open('input.txt', 'r') as f:
        lines = f.readlines()
    
    # Parse input parameters
    params = {}
    for line in lines:
        if '=' in line:
            key, value = line.strip().split('=', 1)
            params[key] = value
    
    # Process input for Two Sum problem
    nums_str = params['nums'].strip()
    target = int(params['target'])
    
    # Parse nums list
    nums_str = nums_str[1:-1]  # Remove [ ]
    nums = [int(x.strip()) for x in nums_str.split(',')]
    
    # Create solution instance and call function
    solution = Solution()
    result = solution.twoSum(nums, target)
    
    # Output result
    print(result)

if __name__ == "__main__":
    main()`,
      javascript: `// Two Sum Problem

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Use a map to store values and their indices
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        // Calculate the complement needed to reach the target
        const complement = target - nums[i];
        
        // Check if complement exists in the map
        if (numMap.has(complement)) {
            // Return the indices of the two numbers
            return [numMap.get(complement), i];
        }
        
        // Store current number and its index
        numMap.set(nums[i], i);
    }
    
    // No solution found
    return [];
}

// Main function to read input and run solution
function main() {
    const fs = require('fs');
    
    // Read input data from file
    const inputData = fs.readFileSync('input.txt', 'utf8');
    const lines = inputData.split('\\n');
    
    // Parse input parameters
    const params = {};
    for (const line of lines) {
        if (line.includes('=')) {
            const [key, value] = line.split('=');
            params[key] = value;
        }
    }
    
    // Process input for Two Sum problem
    let nums;
    if (params.nums) {
        // Parse nums array
        nums = JSON.parse(params.nums.replace('{', '[').replace('}', ']'));
    } else {
        console.error('Missing nums parameter');
        process.exit(1);
    }
    
    const target = parseInt(params.target);
    
    // Call solution function
    const result = twoSum(nums, target);
    
    // Output result
    console.log(JSON.stringify(result));
}

main();`,
      java: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Use a map to store values and their indices
        Map<Integer, Integer> numMap = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            // Calculate the complement needed to reach the target
            int complement = target - nums[i];
            
            // Check if complement exists in the map
            if (numMap.containsKey(complement)) {
                // Return the indices of the two numbers
                return new int[] {numMap.get(complement), i};
            }
            
            // Store current number and its index
            numMap.put(nums[i], i);
        }
        
        // No solution found
        return new int[0];
    }
    
    public static void main(String[] args) {
        try {
            // Read input data from file
            BufferedReader reader = new BufferedReader(new FileReader("input.txt"));
            Map<String, String> params = new HashMap<>();
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("=")) {
                    String[] parts = line.split("=", 2);
                    params.put(parts[0], parts[1]);
                }
            }
            reader.close();
            
            // Process input for Two Sum problem
            String numsStr = params.get("nums");
            int target = Integer.parseInt(params.get("target"));
            
            // Parse nums array
            numsStr = numsStr.substring(1, numsStr.length() - 1); // Remove [ ]
            String[] numStrings = numsStr.split(",");
            int[] nums = new int[numStrings.length];
            
            for (int i = 0; i < numStrings.length; i++) {
                nums[i] = Integer.parseInt(numStrings[i].trim());
            }
            
            // Create solution instance and call function
            Solution solution = new Solution();
            int[] result = solution.twoSum(nums, target);
            
            // Output result
            System.out.println(Arrays.toString(result));
            
        } catch (IOException e) {
            System.err.println("Error reading input file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}`
    };

    // Define the wholeSource data for Palindrome Number
    const palindromeWholeSource = {
      cpp: `#include <iostream>
#include <string>
#include <fstream>
#include <unordered_map>

class Solution {
public:
    bool isPalindrome(int x) {
        // Negative numbers are not palindromes
        if (x < 0) return false;
        
        // Single digit numbers are palindromes
        if (x < 10) return true;
        
        // Numbers ending with 0 are only palindromes if they are 0
        if (x % 10 == 0 && x != 0) return false;
        
        int reversed = 0;
        
        // Reverse the second half of the number
        while (x > reversed) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        
        // For even-length numbers: x == reversed
        // For odd-length numbers: x == reversed/10 (to ignore the middle digit)
        return x == reversed || x == reversed / 10;
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
            params[key] = value;
        }
    }
    inputFile.close();

    // Process input for Palindrome Number problem
    int x = std::stoi(params["x"]);
    
    // Create solution instance
    Solution solution;
    bool result = solution.isPalindrome(x);
    
    // Output result
    std::cout << (result ? "true" : "false") << std::endl;
    
    return 0;
}`,
      python: `# Palindrome Number Problem

class Solution:
    def isPalindrome(self, x):
        """
        :type x: int
        :rtype: bool
        """
        # Negative numbers are not palindromes
        if x < 0:
            return False
        
        # Single digit numbers are palindromes
        if x < 10:
            return True
        
        # Numbers ending with 0 are only palindromes if they are 0
        if x % 10 == 0 and x != 0:
            return False
        
        reversed_num = 0
        
        # Reverse the second half of the number
        while x > reversed_num:
            reversed_num = reversed_num * 10 + x % 10
            x //= 10
        
        # For even-length numbers: x == reversed_num
        # For odd-length numbers: x == reversed_num//10 (to ignore the middle digit)
        return x == reversed_num or x == reversed_num // 10

def main():
    # Read input data from file
    with open('input.txt', 'r') as f:
        lines = f.readlines()
    
    # Parse input parameters
    params = {}
    for line in lines:
        if '=' in line:
            key, value = line.strip().split('=', 1)
            params[key] = value
    
    # Process input for Palindrome Number problem
    x = int(params['x'])
    
    # Create solution instance and call function
    solution = Solution()
    result = solution.isPalindrome(x)
    
    # Output result
    print(str(result).lower())  # Convert to lowercase 'true'/'false'

if __name__ == "__main__":
    main()`,
      javascript: `// Palindrome Number Problem

/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    // Negative numbers are not palindromes
    if (x < 0) return false;
    
    // Single digit numbers are palindromes
    if (x < 10) return true;
    
    // Numbers ending with 0 are only palindromes if they are 0
    if (x % 10 === 0 && x !== 0) return false;
    
    let reversed = 0;
    
    // Reverse the second half of the number
    while (x > reversed) {
        reversed = reversed * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    
    // For even-length numbers: x === reversed
    // For odd-length numbers: x === Math.floor(reversed / 10) (to ignore the middle digit)
    return x === reversed || x === Math.floor(reversed / 10);
}

// Main function to read input and run solution
function main() {
    const fs = require('fs');
    
    // Read input data from file
    const inputData = fs.readFileSync('input.txt', 'utf8');
    const lines = inputData.split('\\n');
    
    // Parse input parameters
    const params = {};
    for (const line of lines) {
        if (line.includes('=')) {
            const [key, value] = line.split('=');
            params[key] = value;
        }
    }
    
    // Process input for Palindrome Number problem
    const x = parseInt(params.x);
    
    // Call solution function
    const result = isPalindrome(x);
    
    // Output result
    console.log(result ? "true" : "false");
}

main();`,
      java: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public boolean isPalindrome(int x) {
        // Negative numbers are not palindromes
        if (x < 0) return false;
        
        // Single digit numbers are palindromes
        if (x < 10) return true;
        
        // Numbers ending with 0 are only palindromes if they are 0
        if (x % 10 == 0 && x != 0) return false;
        
        int reversed = 0;
        
        // Reverse the second half of the number
        while (x > reversed) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        
        // For even-length numbers: x == reversed
        // For odd-length numbers: x == reversed/10 (to ignore the middle digit)
        return x == reversed || x == reversed / 10;
    }
    
    public static void main(String[] args) {
        try {
            // Read input data from file
            BufferedReader reader = new BufferedReader(new FileReader("input.txt"));
            Map<String, String> params = new HashMap<>();
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("=")) {
                    String[] parts = line.split("=", 2);
                    params.put(parts[0], parts[1]);
                }
            }
            reader.close();
            
            // Process input for Palindrome Number problem
            int x = Integer.parseInt(params.get("x"));
            
            // Create solution instance and call function
            Solution solution = new Solution();
            boolean result = solution.isPalindrome(x);
            
            // Output result
            System.out.println(result);
            
        } catch (IOException e) {
            System.err.println("Error reading input file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}`
    };

    // Update Two Sum problem
    console.log("Updating Two Sum problem...");
    const twoSumUpdateResult = await Problem.updateOne(
      { title: "Two Sum" },
      { $set: { wholeSource: twoSumWholeSource } }
    );

    if (twoSumUpdateResult.matchedCount === 0) {
      console.warn("No 'Two Sum' problem found in the collection.");
    } else if (twoSumUpdateResult.modifiedCount > 0) {
      console.log("Two Sum problem updated successfully with wholeSource.");
    } else {
      console.log("Two Sum problem found, but no changes were made (wholeSource may already exist).");
    }

    // Update Palindrome Number problem
    console.log("Updating Palindrome Number problem...");
    const palindromeUpdateResult = await Problem.updateOne(
      { title: "Palindrome Number" },
      { $set: { wholeSource: palindromeWholeSource } }
    );

    if (palindromeUpdateResult.matchedCount === 0) {
      console.warn("No 'Palindrome Number' problem found in the collection.");
    } else if (palindromeUpdateResult.modifiedCount > 0) {
      console.log("Palindrome Number problem updated successfully with wholeSource.");
    } else {
      console.log("Palindrome Number problem found, but no changes were made (wholeSource may already exist).");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating problems:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
addWholeSourceToProblems();
