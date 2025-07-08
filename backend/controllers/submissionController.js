const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");
const executionService = require("../services/executionService");

exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.userId;

    if (!problemId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const validLanguages = ["cpp", "java", "python", "javascript"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid language." });
    }

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

    const executionResults = await executionService.runAllTests(
      code,
      problem.testCases,
      language
    );

    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: executionResults.status,
      executionTime: executionResults.executionTime,
      memoryUsed: 0,
      testCasesPassed: executionResults.testCasesPassed,
      totalTestCases: executionResults.totalTestCases,
      testResults: executionResults.testResults,
    });

    await submission.save();

    try {
      const user = await User.findById(userId);
      
      const isFirstAttempt = !user.problemsAttempted.includes(problemId);
      const wasAlreadySolved = user.problemsSolved.includes(problemId);
      
      await User.findByIdAndUpdate(userId, { $inc: { totalSubmissions: 1 } });

      if (isFirstAttempt) {
        await User.findByIdAndUpdate(userId, { 
          $addToSet: { problemsAttempted: problemId } 
        });
      }

      const isNewSolver = executionResults.status === "Accepted" && !wasAlreadySolved;
      
      if (isNewSolver) {
        await User.findByIdAndUpdate(userId, { 
          $addToSet: { problemsSolved: problemId } 
        });
        
        const difficultyField = `solvedByDifficulty.${problem.difficulty}`;
        await User.findByIdAndUpdate(userId, { 
          $inc: { [difficultyField]: 1 } 
        });
      }

      const updatedUser = await User.findById(userId);
      if (updatedUser.problemsAttempted.length > 0) {
        const successRate = (updatedUser.problemsSolved.length / updatedUser.problemsAttempted.length) * 100;
        await User.findByIdAndUpdate(userId, { successRate });
      }

      const problemToUpdate = await Problem.findById(problemId);
      
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
    }

    const updatedUser = await User.findById(userId).select('problemsSolved problemsAttempted');
    
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
      memoryUsed: 0,
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

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

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
      .select("-code")
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

exports.deleteSubmission = async (req, res) => {
  try {
    const userId = req.user.userId;
    const submissionId = req.params.id;

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

    await Submission.findByIdAndDelete(submissionId);

    if (submission.status === "Accepted") {
      const submissionUser = await User.findById(submission.user);
      if (submissionUser) {
        const otherAcceptedSubmissions = await Submission.countDocuments({
          user: submission.user,
          problem: submission.problem,
          status: "Accepted",
          _id: { $ne: submissionId }
        });

        if (otherAcceptedSubmissions === 0) {
          await User.findByIdAndUpdate(submission.user, {
            $pull: { problemsSolved: submission.problem }
          });

          const problem = await Problem.findById(submission.problem);
          if (problem) {
            const difficultyField = `solvedByDifficulty.${problem.difficulty}`;
            await User.findByIdAndUpdate(submission.user, {
              $inc: { [difficultyField]: -1 }
            });

            problem.uniqueSolvers = Math.max(0, (problem.uniqueSolvers || 1) - 1);
            await problem.save();
          }
        }

        await User.findByIdAndUpdate(submission.user, {
          $inc: { totalSubmissions: -1 }
        });

        const updatedUser = await User.findById(submission.user);
        if (updatedUser.problemsAttempted.length > 0) {
          const successRate = (updatedUser.problemsSolved.length / updatedUser.problemsAttempted.length) * 100;
          await User.findByIdAndUpdate(submission.user, { successRate });
        }
      }
    }

    const problem = await Problem.findById(submission.problem);
    if (problem) {
      problem.totalSubmissions = Math.max(0, (problem.totalSubmissions || 1) - 1);
      if (submission.status === "Accepted") {
        problem.successfulSubmissions = Math.max(0, (problem.successfulSubmissions || 1) - 1);
      }
      await problem.save();
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

    if (submission.user._id.toString() !== userId && (!user || user.role !== "admin")) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(submission);
  } catch (err) {
    console.error("Error fetching submission details:", err);
    res.status(500).json({ error: "Failed to fetch submission details." });
  }
};
