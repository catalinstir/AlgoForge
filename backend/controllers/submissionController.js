const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");
const simpleExecutionService = require("../services/simpleExecutionService");

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

    // Currently only supporting C++
    if (language !== "cpp") {
      return res
        .status(400)
        .json({ error: "Only C++ is currently supported for execution." });
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

    // Make sure this problem has the complete source code in wholeSource.cpp
    if (!problem.wholeSource || !problem.wholeSource.cpp) {
      return res.status(500).json({ 
        error: "Problem is missing complete source code required for testing."
      });
    }

    // Execute all test cases using the simple execution service
    const executionResults = await simpleExecutionService.runAllTests(
      code, 
      problem, 
      problem.testCases
    );

    // Create submission record
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: executionResults.status,
      executionTime: executionResults.executionTime,
      memoryUsed: 0, // Will require additional measurement
      testCasesPassed: executionResults.testCasesPassed,
      totalTestCases: executionResults.totalTestCases,
      testResults: executionResults.testResults,
    });

    await submission.save();

    // Update problem stats
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        totalSubmissions: 1,
        successfulSubmissions: executionResults.status === "Accepted" ? 1 : 0,
      },
    });

    // Update user stats
    const user = await User.findById(userId);

    if (!user.problemsAttempted.includes(problemId)) {
      user.problemsAttempted.push(problemId);
    }

    if (
      executionResults.status === "Accepted" &&
      !user.problemsSolved.includes(problemId)
    ) {
      user.problemsSolved.push(problemId);
    }

    user.totalSubmissions += 1;
    if (user.problemsAttempted.length > 0) {
      user.successRate =
        (user.problemsSolved.length / user.problemsAttempted.length) * 100;
    }

    await user.save();

    // Send response (filter out hidden test cases for the user)
    res.status(201).json({
      submission: {
        id: submission._id,
        status: executionResults.status,
        executionTime: executionResults.executionTime,
        memoryUsed: submission.memoryUsed,
        testCasesPassed: executionResults.testCasesPassed,
        totalTestCases: executionResults.totalTestCases,
        passRate: submission.passRate,
      },
      testResults: executionResults.testResults.filter((test) => !test.hidden),
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

    // Currently only supporting C++
    if (language !== "cpp") {
      return res
        .status(400)
        .json({ error: "Only C++ is currently supported for execution." });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    // Make sure this problem has the complete source code
    if (!problem.wholeSource || !problem.wholeSource.cpp) {
      return res.status(500).json({ 
        error: "Problem is missing complete source code required for testing."
      });
    }

    // Run just the example test cases (not hidden test cases) for "Run Code"
    const exampleTests = problem.examples.map((example) => ({
      input: example.input,
      output: example.output,
      isHidden: false,
    }));

    const executionResults = await simpleExecutionService.runAllTests(
      code,
      problem,
      exampleTests
    );

    res.json({
      status:
        executionResults.testCasesPassed === exampleTests.length
          ? "All Tests Passed"
          : "Some Tests Failed",
      executionTime: executionResults.executionTime,
      memoryUsed: 0, // Will require additional measurement
      testCasesPassed: executionResults.testCasesPassed,
      totalTestCases: exampleTests.length,
      testResults: executionResults.testResults,
    });
  } catch (err) {
    console.error("Error running code:", err);
    res.status(500).json({ error: "Failed to run code." });
  }
};

// The rest of the controller functions remain unchanged
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
