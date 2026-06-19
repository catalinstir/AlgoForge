#!/usr/bin/env node
/**
 * Seed script — populates MongoDB with demo data and prints JWTs.
 *
 * Usage (from repo root):
 *   MONGO_URI=mongodb://localhost:27017/algorush JWT_SECRET=dev-secret-change-me node scripts/seed.js
 *
 * Or if you have a .env file:
 *   node -r dotenv/config scripts/seed.js
 *
 * Inside Docker (while stack is running):
 *   docker compose exec backend node /app/../scripts/seed.js   # (mount or copy first)
 *   -- easier: docker compose exec backend npm run seed        -- if package.json points here
 */

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");

// Load models from backend
const User = require(path.join(__dirname, "../models/User"));
const Problem = require(path.join(__dirname, "../models/Problem"));
const Submission = require(path.join(__dirname, "../models/Submission"));
const ProblemRequest = require(path.join(__dirname, "../models/ProblemRequest"));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// ─── Problem data ────────────────────────────────────────────────────────────

const problemsData = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "First line: space-separated integers (the array).\nSecond line: the target integer.",
    outputFormat: "Two space-separated integers representing the indices (0-indexed).",
    examples: [
      { input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "3 2 4\n6", output: "1 2" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    testCases: [
      { input: "2 7 11 15\n9", output: "0 1" },
      { input: "3 2 4\n6", output: "1 2" },
      { input: "3 3\n6", output: "0 1", isHidden: true },
    ],
    categories: ["Array", "Hash Table"],
    status: "Published",
    totalSubmissions: 120,
    successfulSubmissions: 95,
    uniqueAttempts: 80,
    uniqueSolvers: 70,
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    inputFormat: "A single line with space-separated characters.",
    outputFormat: "The characters in reversed order, space-separated.",
    examples: [
      { input: "h e l l o", output: "o l l e h" },
      { input: "H a n n a h", output: "h a n n a H" },
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ASCII character."],
    testCases: [
      { input: "h e l l o", output: "o l l e h" },
      { input: "H a n n a h", output: "h a n n a H" },
      { input: "a", output: "a", isHidden: true },
    ],
    categories: ["String", "Two Pointers"],
    status: "Published",
    totalSubmissions: 200,
    successfulSubmissions: 180,
    uniqueAttempts: 150,
    uniqueSolvers: 145,
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    inputFormat: "A single line containing the string s.",
    outputFormat: "A single integer — the length of the longest substring without repeating characters.",
    examples: [
      { input: "abcabcbb", output: "3", explanation: "The answer is 'abc', with length 3." },
      { input: "bbbbb", output: "1", explanation: "The answer is 'b', with length 1." },
      { input: "pwwkew", output: "3", explanation: "The answer is 'wke', with length 3." },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    testCases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" },
      { input: " ", output: "0", isHidden: true },
    ],
    categories: ["Hash Table", "Sliding Window", "String"],
    status: "Published",
    totalSubmissions: 90,
    successfulSubmissions: 55,
    uniqueAttempts: 70,
    uniqueSolvers: 48,
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).\n\nThe tree is given as a list of values in BFS order, with -1 representing null nodes.",
    inputFormat: "A single line of space-separated integers representing the BFS-order tree (-1 for null).",
    outputFormat: "Each level on its own line, values space-separated.",
    examples: [
      { input: "3 9 20 -1 -1 15 7", output: "3\n9 20\n15 7" },
      { input: "1", output: "1" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    testCases: [
      { input: "3 9 20 -1 -1 15 7", output: "3\n9 20\n15 7" },
      { input: "1", output: "1" },
      { input: "-1", output: "-1", isHidden: true },
    ],
    categories: ["Tree", "BFS", "Binary Tree"],
    status: "Published",
    totalSubmissions: 60,
    successfulSubmissions: 30,
    uniqueAttempts: 50,
    uniqueSolvers: 28,
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    inputFormat:
      "First line: space-separated integers of nums1.\nSecond line: space-separated integers of nums2.",
    outputFormat: "A single float rounded to 5 decimal places.",
    examples: [
      { input: "1 3\n2", output: "2.00000" },
      { input: "1 2\n3 4", output: "2.50000" },
    ],
    constraints: [
      "nums1.length == m, nums2.length == n",
      "0 <= m, n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    testCases: [
      { input: "1 3\n2", output: "2.00000" },
      { input: "1 2\n3 4", output: "2.50000" },
      { input: "0 0\n0 0", output: "0.00000", isHidden: true },
    ],
    categories: ["Array", "Binary Search", "Divide and Conquer"],
    status: "Published",
    totalSubmissions: 40,
    successfulSubmissions: 10,
    uniqueAttempts: 35,
    uniqueSolvers: 9,
  },
  {
    title: "Regular Expression Matching",
    difficulty: "Hard",
    description:
      "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*`.\n\n- `.` Matches any single character.\n- `*` Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    inputFormat: "First line: the string s.\nSecond line: the pattern p.",
    outputFormat: "true or false",
    examples: [
      { input: "aa\na", output: "false", explanation: "'a' does not match the entire string 'aa'." },
      { input: "aa\na*", output: "true" },
      { input: "ab\n.*", output: "true" },
    ],
    constraints: [
      "1 <= s.length <= 20",
      "1 <= p.length <= 30",
      "s contains only lowercase English letters.",
      "p contains only lowercase English letters, '.', and '*'.",
    ],
    testCases: [
      { input: "aa\na", output: "false" },
      { input: "aa\na*", output: "true" },
      { input: "ab\n.*", output: "true" },
      { input: "aab\nc*a*b", output: "true", isHidden: true },
    ],
    categories: ["String", "Dynamic Programming", "Recursion"],
    status: "Published",
    totalSubmissions: 25,
    successfulSubmissions: 5,
    uniqueAttempts: 22,
    uniqueSolvers: 5,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

  // Wipe existing data
  await Promise.all([
    User.deleteMany({}),
    Problem.deleteMany({}),
    Submission.deleteMany({}),
    ProblemRequest.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    username: "admin",
    email: "admin@algorush.dev",
    password: "Admin1234!",
    role: "admin",
  });

  const user = await User.create({
    username: "alice",
    email: "alice@algorush.dev",
    password: "Alice1234!",
    role: "user",
  });

  // ── Problems ───────────────────────────────────────────────────────────────
  const problems = await Problem.insertMany(
    problemsData.map((p) => ({
      ...p,
      author: admin._id,
      publishedDate: new Date(),
    }))
  );

  // Update admin's uploaded list
  await User.findByIdAndUpdate(admin._id, {
    $set: { problemsUploaded: problems.map((p) => p._id) },
  });

  // ── Submission (one accepted, for alice on Two Sum) ────────────────────────
  const twoSum = problems[0];
  const submission = await Submission.create({
    user: user._id,
    problem: twoSum._id,
    language: "python",
    code: `nums = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor i, n in enumerate(nums):\n    diff = target - n\n    if diff in seen:\n        print(seen[diff], i)\n        break\n    seen[n] = i\n`,
    status: "Accepted",
    executionTime: 42,
    memoryUsed: 14200,
    testCasesPassed: 3,
    totalTestCases: 3,
    testResults: twoSum.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: tc.output,
      passed: true,
      hidden: tc.isHidden || false,
    })),
  });

  // Reflect on user & problem stats
  await User.findByIdAndUpdate(user._id, {
    $addToSet: { problemsSolved: twoSum._id, problemsAttempted: twoSum._id },
    $inc: { totalSubmissions: 1, "solvedByDifficulty.Easy": 1 },
    successRate: 100,
  });

  await Problem.findByIdAndUpdate(twoSum._id, {
    $inc: { totalSubmissions: 1, successfulSubmissions: 1, uniqueAttempts: 1, uniqueSolvers: 1 },
  });

  // ── ProblemRequest (pending, submitted by alice) ───────────────────────────
  const problemRequest = await ProblemRequest.create({
    submitter: user._id,
    title: "Climbing Stairs",
    difficulty: "Easy",
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    inputFormat: "A single integer n.",
    outputFormat: "A single integer — the number of distinct ways.",
    examples: [
      { input: "2", output: "2", explanation: "1+1 or 2" },
      { input: "3", output: "3", explanation: "1+1+1, 1+2, or 2+1" },
    ],
    constraints: ["1 <= n <= 45"],
    testCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "10", output: "89", isHidden: true },
    ],
    functionName: "climbStairs",
    codeTemplates: {
      python: "def climbStairs(n: int) -> int:\n    pass\n",
      javascript: "function climbStairs(n) {\n  \n}\n",
    },
    solutionCode: {
      language: "python",
      code: "def climbStairs(n):\n    a, b = 1, 1\n    for _ in range(n - 1):\n        a, b = b, a + b\n    return b\n",
    },
    categories: ["Dynamic Programming", "Math"],
    status: "Pending",
  });

  // ── Print results ──────────────────────────────────────────────────────────
  const adminToken = makeToken(admin._id);
  const userToken = makeToken(user._id);

  console.log("\n=== Seed complete ===\n");
  console.log("Users:");
  console.log(`  admin   email=admin@algorush.dev   password=Admin1234!   role=admin`);
  console.log(`  alice   email=alice@algorush.dev   password=Alice1234!   role=user`);

  console.log("\nProblems created:");
  problems.forEach((p) => console.log(`  [${p.difficulty.padEnd(6)}] ${p.title}`));

  console.log(`\nSubmission: ${submission._id} (Accepted — alice on Two Sum)`);
  console.log(`ProblemRequest: ${problemRequest._id} (Pending — Climbing Stairs by alice)`);

  console.log("\nJWT tokens (valid 7 days, secret: " + JWT_SECRET + "):");
  console.log(`  admin : ${adminToken}`);
  console.log(`  alice : ${userToken}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
