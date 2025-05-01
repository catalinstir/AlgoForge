require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Problem = require("../models/Problem");

// Sample problems data
const problemsData = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    functionName: "twoSum",
    categories: ["Arrays", "Hash Table"],
    codeTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}`,
    },
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        isHidden: false,
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        isHidden: false,
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        isHidden: false,
      },
      {
        input: "nums = [1,2,3,4,5], target = 9",
        output: "[3,4]",
        isHidden: true,
      },
      {
        input: "nums = [-1,-2,-3,-4,-5], target = -8",
        output: "[2,4]",
        isHidden: true,
      },
    ],
    solutionCode: {
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    },
    status: "Published",
  },
  {
    title: "Palindrome Number",
    difficulty: "Easy",
    description:
      "Given an integer x, return true if x is palindrome integer.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\nFor example, 121 is a palindrome while 123 is not.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation:
          "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
      {
        input: "x = 10",
        output: "false",
        explanation:
          "Reads 01 from right to left. Therefore it is not a palindrome.",
      },
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    functionName: "isPalindrome",
    categories: ["Math"],
    codeTemplates: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    // Write your code here
}`,
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        // Write your code here
    }
};`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your code here
    }
}`,
    },
    testCases: [
      {
        input: "x = 121",
        output: "true",
        isHidden: false,
      },
      {
        input: "x = -121",
        output: "false",
        isHidden: false,
      },
      {
        input: "x = 10",
        output: "false",
        isHidden: false,
      },
      {
        input: "x = 12321",
        output: "true",
        isHidden: true,
      },
      {
        input: "x = 2147483647",
        output: "false",
        isHidden: true,
      },
    ],
    solutionCode: {
      javascript: `function isPalindrome(x) {
    if (x < 0) return false;
    if (x < 10) return true;
    if (x % 10 === 0) return false;
    
    let reversed = 0;
    let original = x;
    
    while (x > 0) {
        reversed = reversed * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    
    return original === reversed;
}`,
    },
    status: "Published",
  },
];

// Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/algorush";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = new User({
      username: "admin",
      email: "admin@algorush.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created");

    // Create problems
    for (const problemData of problemsData) {
      const problem = new Problem({
        ...problemData,
        author: admin._id,
        publishedDate: new Date(),
      });

      await problem.save();

      // Add to admin's uploaded problems
      admin.problemsUploaded.push(problem._id);
    }

    await admin.save();
    console.log(`${problemsData.length} problems created`);

    // Create a regular user
    const userSalt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash("user123", userSalt);

    const user = new User({
      username: "user",
      email: "user@algorush.com",
      password: userPassword,
      role: "user",
    });

    await user.save();
    console.log("Regular user created");

    console.log("Database seeding completed successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
