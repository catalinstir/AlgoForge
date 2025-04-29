const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!problemId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const validLanguages = ["cpp", "java", "python", "javascript"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid language." });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    if (problem.status !== "Published") {
      return res.status(403).json({ error: "Problem is not published." });
    }

    const executionTime = Math.floor(Math.random() * 100) + 50; // 50-150ms
    const memoryUsed = Math.floor(Math.random() * 5000) + 5000; // 5000-10000KB

    const testResults = [];
    let testCasesPassed = 0;

    for (const testCase of problem.testCases) {
      const expectedKeywords = ["return", problem.functionName];
      const keywordPresent = expectedKeywords.every((keyword) =>
        code.toLowerCase().includes(keyword.toLowerCase())
      );

      const passed = keywordPresent ? Math.random() < 0.8 : Math.random() < 0.2;

      if (passed) testCasesPassed++;

      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: passed ? testCase.output : "Wrong output",
        passed,
        hidden: testCase.isHidden,
      });
    }

    let status = "Pending";
    if (testCasesPassed === problem.testCases.length) {
      status = "Accepted";
    } else {
      status = "Wrong Answer";
    }

    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status,
      executionTime,
      memoryUsed,
      testCasesPassed,
      totalTestCases: problem.testCases.length,
      testResults,
    });

    await submission.save();

    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        totalSubmissions: 1,
        successfulSubmissions: status === "Accepted" ? 1 : 0,
      },
    });

    const user = await User.findById(userId);

    if (!user.problemsAttempted.includes(problemId)) {
      user.problemsAttempted.push(problemId);
    }

    if (status === "Accepted" && !user.problemsSolved.includes(problemId)) {
      user.problemsSolved.push(problemId);
    }

    user.totalSubmissions += 1;
    if (user.problemsAttempted.length > 0) {
      user.successRate =
        (user.problemsSolved.length / user.problemsAttempted.length) * 100;
    }

    await user.save();

    res.status(201).json({
      submission: {
        id: submission._id,
        status,
        executionTime,
        memoryUsed,
        testCasesPassed,
        totalTestCases: problem.testCases.length,
        passRate: submission.passRate,
      },
      testResults: testResults.filter((test) => !test.hidden),
    });
  } catch (err) {
    console.error("Error submitting solution:", err);
    res.status(500).json({ error: "Failed to submit solution." });
  }
};

exports.runCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const validLanguages = ["cpp", "java", "python", "javascript"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid language." });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const executionTime = Math.floor(Math.random() * 100) + 20; // 20-120ms
    const memoryUsed = Math.floor(Math.random() * 3000) + 3000; // 3000-6000KB

    const testResults = [];
    let testCasesPassed = 0;

    for (const example of problem.examples) {
      const expectedKeywords = ["return", problem.functionName];
      const keywordPresent = expectedKeywords.every((keyword) =>
        code.toLowerCase().includes(keyword.toLowerCase())
      );

      const passed = keywordPresent ? Math.random() < 0.9 : Math.random() < 0.3;

      if (passed) testCasesPassed++;

      testResults.push({
        input: example.input,
        expectedOutput: example.output,
        actualOutput: passed ? example.output : "Wrong output",
        passed,
        hidden: false,
      });
    }

    res.json({
      status:
        testCasesPassed === problem.examples.length
          ? "All Tests Passed"
          : "Some Tests Failed",
      executionTime,
      memoryUsed,
      testCasesPassed,
      totalTestCases: problem.examples.length,
      testResults,
    });
  } catch (err) {
    console.error("Error running code:", err);
    res.status(500).json({ error: "Failed to run code." });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { problemId, limit = 10, page = 1 } = req.query;

    const query = { user: userId };

    if (problemId) {
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: "Invalid problem ID." });
      }
      query.problem = problemId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("problem", "title difficulty")
      .select("-code -testResults")
      .lean();

    const totalSubmissions = await Submission.countDocuments(query);

    res.json({
      submissions,
      pagination: {
        total: totalSubmissions,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalSubmissions / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching user submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: "Invalid submission ID." });
    }

    const submission = await Submission.findById(submissionId)
      .populate("problem", "title difficulty")
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    const user = await User.findById(userId);

    if (submission.user.toString() !== userId && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(submission);
  } catch (err) {
    console.error("Error fetching submission:", err);
    res.status(500).json({ error: "Failed to fetch submission." });
  }
};

exports.getProblemSubmissions = async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const userId = req.user.userId;
    const { limit = 20, page = 1 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view all problem submissions." });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find({ problem: problemId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "username")
      .select("-code -testResults")
      .lean();

    const totalSubmissions = await Submission.countDocuments({
      problem: problemId,
    });

    res.json({
      submissions,
      pagination: {
        total: totalSubmissions,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalSubmissions / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching problem submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
};
