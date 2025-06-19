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

// 6 problems: 2 Easy, 2 Medium, 2 Hard
const problemsData = [
  // ========== EASY PROBLEMS ==========
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "First line contains space-separated integers representing the array.\nSecond line contains the target integer.",
    outputFormat: "Two space-separated integers representing the indices of the two numbers that add up to target.",
    examples: [
      {
        input: "2 7 11 15\n9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "3 2 4\n6",
        output: "1 2",
      },
      {
        input: "3 3\n6",
        output: "0 1",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    categories: ["Arrays", "Hash Table"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <fstream>", "#include <vector>", "#include <unordered_map>", "#include <sstream>"],
      python: ["# with open('input.txt', 'r') as f:"],
      javascript: ["const fs = require('fs');"],
      java: ["import java.util.*;", "import java.io.*;"]
    },
    testCases: [
      { input: "2 7 11 15\n9", output: "0 1", isHidden: false },
      { input: "3 2 4\n6", output: "1 2", isHidden: false },
      { input: "3 3\n6", output: "0 1", isHidden: false },
      { input: "1 2 3 4 5\n9", output: "3 4", isHidden: true },
      { input: "-1 -2 -3 -4 -5\n-8", output: "2 4", isHidden: true },
    ],
    status: "Published",
  },
  {
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is palindrome integer.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\nFor example, 121 is a palindrome while 123 is not.",
    inputFormat: "A single integer x.",
    outputFormat: "true if the number is a palindrome, false otherwise.",
    examples: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "-121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
      {
        input: "10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome.",
      },
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    categories: ["Math"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <fstream>"],
      python: ["# with open('input.txt', 'r') as f:"],
      javascript: ["const fs = require('fs');"],
      java: ["import java.io.*;"]
    },
    testCases: [
      { input: "121", output: "true", isHidden: false },
      { input: "-121", output: "false", isHidden: false },
      { input: "10", output: "false", isHidden: false },
      { input: "12321", output: "true", isHidden: true },
      { input: "2147483647", output: "false", isHidden: true },
    ],
    status: "Published",
  },

  // ========== MEDIUM PROBLEMS ==========
  {
    title: "Add Two Numbers",
    difficulty: "Medium",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    inputFormat: "First line contains space-separated digits of the first number (in reverse order).\nSecond line contains space-separated digits of the second number (in reverse order).",
    outputFormat: "Space-separated digits representing the sum (in reverse order).",
    examples: [
      {
        input: "2 4 3\n5 6 4",
        output: "7 0 8",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "0\n0",
        output: "0",
      },
      {
        input: "9 9 9 9 9 9 9\n9 9 9 9",
        output: "8 9 9 9 0 0 0 1",
      },
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros.",
    ],
    categories: ["Linked List", "Math", "Recursion"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <vector>", "#include <sstream>"],
      python: ["# No special imports needed"],
      javascript: ["const readline = require('readline');"],
      java: ["import java.util.*;", "import java.io.*;"]
    },
    testCases: [
      { input: "2 4 3\n5 6 4", output: "7 0 8", isHidden: false },
      { input: "0\n0", output: "0", isHidden: false },
      { input: "9 9 9 9 9 9 9\n9 9 9 9", output: "8 9 9 9 0 0 0 1", isHidden: false },
      { input: "1 8\n0", output: "1 8", isHidden: true },
      { input: "9 9\n9", output: "8 0 1", isHidden: true },
    ],
    status: "Published",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    inputFormat: "A single line containing the string s.\nNote: Empty string is represented as 'empty'.",
    outputFormat: "An integer representing the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "abcabcbb",
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: "bbbbb",
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: "pwwkew",
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
      {
        input: "empty",
        output: "0",
        explanation: 'Empty string has no characters, so length is 0.',
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    categories: ["Hash Table", "String", "Sliding Window"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <string>", "#include <unordered_set>", "#include <algorithm>"],
      python: ["# No special imports needed"],
      javascript: ["const readline = require('readline');"],
      java: ["import java.util.*;", "import java.io.*;"]
    },
    testCases: [
      { input: "abcabcbb", output: "3", isHidden: false },
      { input: "bbbbb", output: "1", isHidden: false },
      { input: "pwwkew", output: "3", isHidden: false },
      { input: "empty", output: "0", isHidden: true },
      { input: "dvdf", output: "3", isHidden: true },
    ],
    status: "Published",
  },

  // ========== HARD PROBLEMS ==========
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    inputFormat: "First line contains space-separated integers of the first sorted array.\nSecond line contains space-separated integers of the second sorted array.\nNote: Empty arrays are represented by a single line containing only 'empty'.",
    outputFormat: "A single number representing the median (format as integer if it's a whole number, otherwise as decimal with one decimal place).",
    examples: [
      {
        input: "1 3\n2",
        output: "2.0",
        explanation: "merged array = [1,2,3] and median is 2.",
      },
      {
        input: "1 2\n3 4",
        output: "2.5",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    categories: ["Array", "Binary Search", "Divide and Conquer"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <vector>", "#include <sstream>", "#include <algorithm>", "#include <iomanip>"],
      python: ["# No special imports needed"],
      javascript: ["const readline = require('readline');"],
      java: ["import java.util.*;", "import java.io.*;", "import java.text.DecimalFormat;"]
    },
    testCases: [
      { input: "1 3\n2", output: "2.0", isHidden: false },
      { input: "1 2\n3 4", output: "2.5", isHidden: false },
      { input: "empty\n1", output: "1.0", isHidden: true },
      { input: "2\nempty", output: "2.0", isHidden: true },
      { input: "1 2 3 4 5\n6 7 8 9 10", output: "5.5", isHidden: true },
    ],
    status: "Published",
  },
  {
    title: "Regular Expression Matching",
    difficulty: "Hard",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n\n'.' Matches any single character.\n'*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    inputFormat: "First line contains the input string s.\nSecond line contains the pattern p.",
    outputFormat: "true if s matches p, false otherwise.",
    examples: [
      {
        input: "aa\na",
        output: "false",
        explanation: 'a does not match the entire string aa.',
      },
      {
        input: "aa\na*",
        output: "true",
        explanation: "'*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes \"aa\".",
      },
      {
        input: "ab\n.*",
        output: "true",
        explanation: "\".*\" means \"zero or more (*) of any character (.)\".",
      },
    ],
    constraints: [
      "1 <= s.length <= 20",
      "1 <= p.length <= 30",
      "s contains only lowercase English letters.",
      "p contains only lowercase English letters, '.', and '*'.",
      "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match.",
    ],
    categories: ["String", "Dynamic Programming", "Recursion"],
    suggestedIncludes: {
      cpp: ["#include <iostream>", "#include <string>", "#include <vector>"],
      python: ["# No special imports needed"],
      javascript: ["const readline = require('readline');"],
      java: ["import java.util.*;", "import java.io.*;"]
    },
    testCases: [
      { input: "aa\na", output: "false", isHidden: false },
      { input: "aa\na*", output: "true", isHidden: false },
      { input: "ab\n.*", output: "true", isHidden: false },
      { input: "aab\nc*a*b", output: "true", isHidden: true },
      { input: "mississippi\nmis*is*p*.", output: "false", isHidden: true },
    ],
    status: "Published",
  },
];

async function createProblems() {
  try {
    console.log("Creating 6 problems (2 Easy, 2 Medium, 2 Hard)...");

    // Find admin user (or create one if it doesn't exist)
    let admin = await User.findOne({ role: "admin" });
    
    if (!admin) {
      console.log("No admin user found, creating one...");
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      admin = new User({
        username: "admin",
        email: "admin@algorush.com",
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("Admin user created");
    }

    // Create problems
    for (const problemData of problemsData) {
      const problem = new Problem({
        ...problemData,
        author: admin._id,
        publishedDate: new Date(),
      });

      await problem.save();

      // Add to admin's uploaded problems
      if (!admin.problemsUploaded.includes(problem._id)) {
        admin.problemsUploaded.push(problem._id);
      }

      console.log(`✓ Created ${problemData.difficulty} problem: ${problemData.title}`);
    }

    await admin.save();

    console.log(`\n✅ Successfully created ${problemsData.length} problems!`);
    console.log("\nProblem breakdown:");
    console.log("Easy: Two Sum, Palindrome Number");
    console.log("Medium: Add Two Numbers, Longest Substring Without Repeating Characters");
    console.log("Hard: Median of Two Sorted Arrays, Regular Expression Matching");
    
    console.log("\nFeatures:");
    console.log("- No solutionCode field stored");
    console.log("- No codeTemplates field stored");
    console.log("- Only suggestedIncludes as hints");
    console.log("- Complete stdin/stdout format");
    console.log("- Users write programs from scratch");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error creating problems:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createProblems();
