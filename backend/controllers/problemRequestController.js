const ProblemRequest = require("../models/ProblemRequest");
const Problem = require("../models/Problem");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.submitProblemRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      difficulty,
      description,
      examples,
      constraints,
      testCases,
      functionName,
      codeTemplates,
      solutionCode,
      categories,
    } = req.body;

    if (
      !title ||
      !difficulty ||
      !description ||
      !functionName ||
      !solutionCode ||
      !solutionCode.code ||
      !solutionCode.language
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingProblemTitle = await Problem.findOne({ title });
    const existingRequestTitle = await ProblemRequest.findOne({
      title,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingProblemTitle || existingRequestTitle) {
      return res
        .status(400)
        .json({
          error: "A problem or request with this title already exists.",
        });
    }

    const problemRequest = new ProblemRequest({
      submitter: userId,
      title,
      difficulty,
      description,
      examples: examples || [],
      constraints: constraints || [],
      testCases: testCases || [],
      functionName,
      codeTemplates: codeTemplates || {},
      solutionCode: solutionCode,
      categories: categories || [],
    });

    await problemRequest.save();

    res.status(201).json({
      message: "Problem request submitted successfully.",
      requestId: problemRequest._id,
    });
  } catch (err) {
    console.error("Error submitting problem request:", err);
    res.status(500).json({ error: "Failed to submit problem request." });
  }
};

exports.getUserProblemRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await ProblemRequest.find({ submitter: userId })
      .sort({ createdAt: -1 })
      .select("-testCases -codeTemplates -solutionCode") // Exclude large fields
      .lean();

    res.json(requests);
  } catch (err) {
    console.error("Error fetching user problem requests:", err);
    res.status(500).json({ error: "Failed to fetch problem requests." });
  }
};

exports.getProblemRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID." });
    }

    const request = await ProblemRequest.findById(requestId).lean();

    if (!request) {
      return res.status(404).json({ error: "Problem request not found." });
    }

    const user = await User.findById(userId);

    if (request.submitter.toString() !== userId && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(request);
  } catch (err) {
    console.error("Error fetching problem request:", err);
    res.status(500).json({ error: "Failed to fetch problem request." });
  }
};

exports.updateProblemRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID." });
    }

    const request = await ProblemRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Problem request not found." });
    }

    if (request.submitter.toString() !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          error: `Cannot update ${request.status.toLowerCase()} request.`,
        });
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
      solutionCode,
      categories,
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (difficulty) updateData.difficulty = difficulty;
    if (description) updateData.description = description;
    if (examples) updateData.examples = examples;
    if (constraints) updateData.constraints = constraints;
    if (testCases) updateData.testCases = testCases;
    if (functionName) updateData.functionName = functionName;
    if (codeTemplates) updateData.codeTemplates = codeTemplates;
    if (solutionCode) updateData.solutionCode = solutionCode;
    if (categories) updateData.categories = categories;

    if (title && title !== request.title) {
      const existingProblemTitle = await Problem.findOne({ title });
      const existingRequestTitle = await ProblemRequest.findOne({
        _id: { $ne: requestId },
        title,
        status: { $in: ["Pending", "Approved"] },
      });

      if (existingProblemTitle || existingRequestTitle) {
        return res
          .status(400)
          .json({
            error: "A problem or request with this title already exists.",
          });
      }
    }

    const updatedRequest = await ProblemRequest.findByIdAndUpdate(
      requestId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Problem request updated successfully.",
      request: updatedRequest,
    });
  } catch (err) {
    console.error("Error updating problem request:", err);
    res.status(500).json({ error: "Failed to update problem request." });
  }
};

exports.cancelProblemRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID." });
    }

    const request = await ProblemRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Problem request not found." });
    }

    if (request.submitter.toString() !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          error: `Cannot cancel ${request.status.toLowerCase()} request.`,
        });
    }

    await ProblemRequest.findByIdAndUpdate(requestId, {
      $set: {
        status: "Rejected",
        feedback: "Canceled by submitter.",
      },
    });

    res.json({ message: "Problem request canceled successfully." });
  } catch (err) {
    console.error("Error canceling problem request:", err);
    res.status(500).json({ error: "Failed to cancel problem request." });
  }
};

exports.getAllProblemRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, page = 1 } = req.query;

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view all problem requests." });
    }

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await ProblemRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("submitter", "username")
      .select("-testCases -codeTemplates -solutionCode")
      .lean();

    const totalRequests = await ProblemRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        total: totalRequests,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalRequests / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching problem requests:", err);
    res.status(500).json({ error: "Failed to fetch problem requests." });
  }
};

exports.reviewProblemRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;
    const { status, feedback } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'Approved' or 'Rejected'." });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID." });
    }

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can review problem requests." });
    }

    const request = await ProblemRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Problem request not found." });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          error: `Request has already been ${request.status.toLowerCase()}.`,
        });
    }

    const updatedRequest = await ProblemRequest.findByIdAndUpdate(
      requestId,
      {
        $set: {
          status,
          reviewedBy: userId,
          reviewedAt: Date.now(),
          feedback:
            feedback ||
            (status === "Approved"
              ? "Approved by admin."
              : "Rejected by admin."),
        },
      },
      { new: true }
    );

    if (status === "Approved") {
      const problem = new Problem({
        title: request.title,
        difficulty: request.difficulty,
        description: request.description,
        examples: request.examples,
        constraints: request.constraints,
        testCases: request.testCases,
        functionName: request.functionName,
        codeTemplates: request.codeTemplates,
        author: request.submitter,
        categories: request.categories,
        solutionCode: {
          [request.solutionCode.language]: request.solutionCode.code,
        },
        status: "Published",
        publishedDate: Date.now(),
      });

      await problem.save();

      await ProblemRequest.findByIdAndUpdate(requestId, {
        $set: {
          approvedProblem: problem._id,
        },
      });

      await User.findByIdAndUpdate(request.submitter, {
        $push: { problemsUploaded: problem._id },
      });

      return res.json({
        message: "Problem request approved and published.",
        request: updatedRequest,
        problem: {
          id: problem._id,
          title: problem.title,
        },
      });
    }

    res.json({
      message: `Problem request ${status.toLowerCase()}.`,
      request: updatedRequest,
    });
  } catch (err) {
    console.error("Error reviewing problem request:", err);
    res.status(500).json({ error: "Failed to review problem request." });
  }
};
