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

exports.getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      status, 
      language, 
      problemId, 
      userId: filterUserId,
      limit = 20, 
      page = 1 
    } = req.query;

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (language) {
      query.language = language;
    }
    
    if (problemId) {
      if (mongoose.Types.ObjectId.isValid(problemId)) {
        query.problem = problemId;
      } else {
        // If not a valid ObjectId, search by problem title
        const problems = await Problem.find({ 
          title: { $regex: problemId, $options: "i" } 
        }).select('_id');
        query.problem = { $in: problems.map(p => p._id) };
      }
    }
    
    if (filterUserId) {
      if (mongoose.Types.ObjectId.isValid(filterUserId)) {
        query.user = filterUserId;
      } else {
        // If not a valid ObjectId, search by username
        const users = await User.find({ 
          username: { $regex: filterUserId, $options: "i" } 
        }).select('_id');
        query.user = { $in: users.map(u => u._id) };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "username email")
      .populate("problem", "title difficulty")
      .select("-code") // Don't include the actual code for privacy
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
    console.error("Error fetching all submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
};

// Add this method for deleting submissions (admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    const userId = req.user.userId;
    const submissionId = req.params.id;

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: "Invalid submission ID." });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    // Delete the submission
    await Submission.findByIdAndDelete(submissionId);

    // Update user stats if this was an accepted submission
    if (submission.status === "Accepted") {
      const submissionUser = await User.findById(submission.user);
      if (submissionUser) {
        // Check if this was the user's only accepted submission for this problem
        const otherAcceptedSubmissions = await Submission.countDocuments({
          user: submission.user,
          problem: submission.problem,
          status: "Accepted",
          _id: { $ne: submissionId }
        });

        if (otherAcceptedSubmissions === 0) {
          // Remove from solved problems
          await User.findByIdAndUpdate(submission.user, {
            $pull: { problemsSolved: submission.problem }
          });

          // Update difficulty tracking
          const problem = await Problem.findById(submission.problem);
          if (problem) {
            const difficultyField = `solvedByDifficulty.${problem.difficulty}`;
            await User.findByIdAndUpdate(submission.user, {
              $inc: { [difficultyField]: -1 }
            });

            // Update problem stats
            problem.uniqueSolvers = Math.max(0, (problem.uniqueSolvers || 1) - 1);
            await problem.save();
          }
        }

        // Update total submissions count
        await User.findByIdAndUpdate(submission.user, {
          $inc: { totalSubmissions: -1 }
        });

        // Recalculate success rate
        const updatedUser = await User.findById(submission.user);
        if (updatedUser.problemsAttempted.length > 0) {
          const successRate = (updatedUser.problemsSolved.length / updatedUser.problemsAttempted.length) * 100;
          await User.findByIdAndUpdate(submission.user, { successRate });
        }
      }
    }

    // Update problem submission stats
    const problem = await Problem.findById(submission.problem);
    if (problem) {
      problem.totalSubmissions = Math.max(0, (problem.totalSubmissions || 1) - 1);
      if (submission.status === "Accepted") {
        problem.successfulSubmissions = Math.max(0, (problem.successfulSubmissions || 1) - 1);
      }
      await problem.save(); // This will trigger acceptance rate recalculation
    }

    res.json({ 
      message: "Submission deleted successfully.",
      deletedSubmission: {
        id: submission._id,
        user: submission.user,
        problem: submission.problem,
        status: submission.status
      }
    });
  } catch (err) {
    console.error("Error deleting submission:", err);
    res.status(500).json({ error: "Failed to delete submission." });
  }
};

// Add this method for getting submission details (admin only)
exports.getSubmissionDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const submissionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: "Invalid submission ID." });
    }

    const submission = await Submission.findById(submissionId)
      .populate("user", "username email role")
      .populate("problem", "title difficulty description")
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    const user = await User.findById(userId);

    // Allow access if user is admin or if it's their own submission
    if (submission.user._id.toString() !== userId && (!user || user.role !== "admin")) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(submission);
  } catch (err) {
    console.error("Error fetching submission details:", err);
    res.status(500).json({ error: "Failed to fetch submission details." });
  }
};
