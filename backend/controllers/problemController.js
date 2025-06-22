const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getAllProblems = async (req, res) => {
  try {
    const { difficulty, category, search } = req.query;

    const filter = { status: "Published" };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const problems = await Problem.find(filter)
      .select("id title difficulty description acceptance totalSubmissions uniqueAttempts uniqueSolvers categories")
      .sort({ id: 1 }) // Sort by ID
      .lean();

    res.json(problems);
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).json({ error: "Failed to fetch problems." });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId)
      .populate("author", "username")
      .lean();

    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    if (problem.status !== "Published") {
      if (!req.user) {
        return res.status(403).json({ error: "Access denied." });
      }

      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (
        !user ||
        (user._id.toString() !== problem.author._id.toString() &&
          user.role !== "admin")
      ) {
        return res.status(403).json({ error: "Access denied." });
      }
    }

    if (req.user) {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (
        user.role !== "admin" &&
        user._id.toString() !== problem.author._id.toString()
      ) {
        problem.testCases = problem.testCases.filter((test) => !test.isHidden);

        delete problem.solutionCode;
      }
    } else {
      problem.testCases = problem.testCases.filter((test) => !test.isHidden);
      delete problem.solutionCode;
    }

    res.json(problem);
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Failed to fetch problem." });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can create problems directly." });
    }

    const {
      title,
      difficulty,
      description,
      examples,
      constraints,
      testCases,
      functionName,
      codeTemplates,
      fullSourceTemplates, // Add support for fullSourceTemplates
      categories,
      solutionCode,
      status,
    } = req.body;

    if (!title || !difficulty || !description || !functionName) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
      return res
        .status(400)
        .json({ error: "A problem with this title already exists." });
    }

    const problem = new Problem({
      title,
      difficulty,
      description,
      examples: examples || [],
      constraints: constraints || [],
      testCases: testCases || [],
      functionName,
      codeTemplates: codeTemplates || {},
      fullSourceTemplates: fullSourceTemplates || {}, // Store fullSourceTemplates
      author: userId,
      categories: categories || [],
      solutionCode: solutionCode || {},
      status: status || "Draft",
      // Initialize stats
      totalSubmissions: 0,
      successfulSubmissions: 0,
      uniqueAttempts: 0,
      uniqueSolvers: 0,
    });

    if (problem.status === "Published") {
      problem.publishedDate = Date.now();
    }

    await problem.save();

    await User.findByIdAndUpdate(userId, {
      $push: { problemsUploaded: problem._id },
    });

    res.status(201).json(problem);
  } catch (err) {
    console.error("Error creating problem:", err);
    res.status(500).json({ error: "Failed to create problem." });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const problemId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const user = await User.findById(userId);

    if (user.role !== "admin" && problem.author.toString() !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    const isAdmin = user.role === "admin";
    const isAuthor = problem.author.toString() === userId;
    const isPublished = problem.status === "Published";

    const updateData = {};

    if (!isPublished || isAdmin) {
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.examples) updateData.examples = req.body.examples;
      if (req.body.constraints) updateData.constraints = req.body.constraints;
      if (req.body.testCases) updateData.testCases = req.body.testCases;
      if (req.body.codeTemplates)
        updateData.codeTemplates = req.body.codeTemplates;
      if (req.body.fullSourceTemplates) // Add support for fullSourceTemplates
        updateData.fullSourceTemplates = req.body.fullSourceTemplates;
      if (req.body.categories) updateData.categories = req.body.categories;
      if (req.body.solutionCode)
        updateData.solutionCode = req.body.solutionCode;
    }

    if (isAdmin) {
      if (req.body.difficulty) updateData.difficulty = req.body.difficulty;
      if (req.body.functionName)
        updateData.functionName = req.body.functionName;
      if (req.body.status) {
        updateData.status = req.body.status;

        if (req.body.status === "Published" && problem.status !== "Published") {
          updateData.publishedDate = Date.now();
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      problemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedProblem);
  } catch (err) {
    console.error("Error updating problem:", err);
    res.status(500).json({ error: "Failed to update problem." });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const problemId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can delete problems." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    await Problem.findByIdAndDelete(problemId);

    await User.updateMany(
      {
        $or: [
          { problemsUploaded: problemId },
          { problemsAttempted: problemId },
          { problemsSolved: problemId },
        ],
      },
      {
        $pull: {
          problemsUploaded: problemId,
          problemsAttempted: problemId,
          problemsSolved: problemId,
        },
      }
    );

    res.json({ message: "Problem deleted successfully." });
  } catch (err) {
    console.error("Error deleting problem:", err);
    res.status(500).json({ error: "Failed to delete problem." });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Problem.aggregate([
      { $match: { status: "Published" } },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 },
          exampleProblem: { $first: "$title" },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          exampleProblem: 1,
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
    ]);

    const categoriesWithDescriptions = categories.map((category) => {
      const descriptions = {
        Arrays:
          "Problems involving array manipulation, searching, sorting, etc.",
        Strings:
          "Tasks related to string processing, pattern matching, and manipulation.",
        "Linked Lists": "Challenges involving singly or doubly linked lists.",
        Trees: "Problems related to tree data structures and traversals.",
        Graphs:
          "Problems on graph theory, traversal algorithms, and properties.",
        "Dynamic Programming":
          "Optimize solutions using Dynamic Programming techniques.",
        Greedy: "Problems solved using greedy algorithms.",
        "Binary Search": "Problems involving binary search algorithms.",
        Hashing: "Utilize hash tables for efficient lookups.",
        Math: "Mathematical problems and number theory.",
      };

      return {
        ...category,
        description:
          descriptions[category.name] ||
          `Problems related to ${category.name}.`,
      };
    });

    res.json(categoriesWithDescriptions);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
};

exports.getProblemStats = async (req, res) => {
  try {
    const problemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID." });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const stats = await mongoose.model("Submission").aggregate([
      { $match: { problem: mongoose.Types.ObjectId(problemId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgExecutionTime: { $avg: "$executionTime" },
          avgMemoryUsed: { $avg: "$memoryUsed" },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          avgExecutionTime: 1,
          avgMemoryUsed: 1,
          _id: 0,
        },
      },
    ]);

    const languageStats = await mongoose.model("Submission").aggregate([
      { $match: { problem: mongoose.Types.ObjectId(problemId) } },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          language: "$_id",
          count: 1,
          acceptedCount: 1,
          acceptanceRate: {
            $cond: [
              { $eq: ["$count", 0] },
              0,
              { $multiply: [{ $divide: ["$acceptedCount", "$count"] }, 100] },
            ],
          },
          _id: 0,
        },
      },
    ]);

    res.json({
      problem: {
        id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        totalSubmissions: problem.totalSubmissions,
        successfulSubmissions: problem.successfulSubmissions,
        uniqueAttempts: problem.uniqueAttempts,
        uniqueSolvers: problem.uniqueSolvers,
        acceptance: problem.acceptance,
      },
      statusStats: stats,
      languageStats: languageStats,
    });
  } catch (err) {
    console.error("Error fetching problem statistics:", err);
    res.status(500).json({ error: "Failed to fetch problem statistics." });
  }
};
