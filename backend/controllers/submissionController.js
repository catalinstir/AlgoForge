const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");
const executionService = require("../services/executionService");

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

    // Currently supporting C++, Python, and JavaScript
    if (!["cpp", "python", "javascript"].includes(language)) {
      return res
        .status(400)
        .json({ error: "Only C++, Python, and JavaScript are currently supported for execution." });
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

    // Execute all test cases using the execution service
    const executionResults = await executionService.runAllTests(
      code,
      problem.testCases,
      language
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

    // Update user and problem stats (without transactions for local dev)
    try {
      // Get user data first
      const user = await User.findById(userId);
      
      // Track if this is the user's first attempt at this problem
      const isFirstAttempt = !user.problemsAttempted.includes(problemId);
      const wasAlreadySolved = user.problemsSolved.includes(problemId);
      
      // Always increment total submissions
      await User.findByIdAndUpdate(userId, { $inc: { totalSubmissions: 1 } });

      // Add to attempted if first attempt
      if (isFirstAttempt) {
        await User.findByIdAndUpdate(userId, { 
          $addToSet: { problemsAttempted: problemId } 
        });
      }

      // If the solution is accepted and user hasn't solved this problem before
      const isNewSolver = executionResults.status === "Accepted" && !wasAlreadySolved;
      
      if (isNewSolver) {
        // Add to solved problems
        await User.findByIdAndUpdate(userId, { 
          $addToSet: { problemsSolved: problemId } 
        });
        
        // Update difficulty tracking
        const difficultyField = `solvedByDifficulty.${problem.difficulty}`;
        await User.findByIdAndUpdate(userId, { 
          $inc: { [difficultyField]: 1 } 
        });
      }

      // Recalculate success rate
      const updatedUser = await User.findById(userId);
      if (updatedUser.problemsAttempted.length > 0) {
        const successRate = (updatedUser.problemsSolved.length / updatedUser.problemsAttempted.length) * 100;
        await User.findByIdAndUpdate(userId, { successRate });
      }

      // Update problem stats - CRITICAL: Use .save() to trigger middleware
      const problemToUpdate = await Problem.findById(problemId);
      
      // Update the stats
      problemToUpdate.totalSubmissions = (problemToUpdate.totalSubmissions || 0) + 1;
      
      if (executionResults.status === "Accepted") {
        problemToUpdate.successfulSubmissions = (problemToUpdate.successfulSubmissions || 0) + 1;
      }
      
      if (isFirstAttempt) {
        problemToUpdate.uniqueAttempts = (problemToUpdate.uniqueAttempts || 0) + 1;
      }
      
      if (isNewSolver) {
        problemToUpdate.uniqueSolvers = (problemToUpdate.uniqueSolvers || 0) + 1;
      }

      // IMPORTANT: Use .save() to trigger the pre-save middleware that calculates acceptance rate
      await problemToUpdate.save();

      console.log(`Updated stats for problem ${problemToUpdate.title}:`, {
        isFirstAttempt,
        isNewSolver,
        status: executionResults.status,
        totalSubmissions: problemToUpdate.totalSubmissions,
        successfulSubmissions: problemToUpdate.successfulSubmissions,
        acceptance: problemToUpdate.acceptance
      });

    } catch (statsError) {
      console.error("Error updating stats:", statsError);
      // Don't fail the submission if stats update fails
    }

    // Get updated user data to return current counts
    const updatedUser = await User.findById(userId).select('problemsSolved problemsAttempted');
    
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
      // Include updated user stats for frontend
      userStats: {
        problemsSolvedCount: updatedUser.problemsSolved.length,
        problemsAttemptedCount: updatedUser.problemsAttempted.length,
        isNewSolve: executionResults.status === "Accepted" && !updatedUser.problemsSolved.includes(problemId)
      }
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

    // Currently supporting C++, Python, and JavaScript
    if (!["cpp", "python", "javascript"].includes(language)) {
      return res
        .status(400)
        .json({ error: "Only C++, Python, and JavaScript are currently supported for execution." });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    // Run just the example test cases (not hidden test cases) for "Run Code"
    const exampleTests = problem.examples.map((example) => ({
      input: example.input,
      output: example.output,
      isHidden: false,
    }));

    const executionResults = await executionService.runAllTests(
      code,
      exampleTests,
      language
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
