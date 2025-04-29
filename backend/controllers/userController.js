const User = require("../models/User");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const mongoose = require("mongoose");

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const totalProblemsCount = await Problem.countDocuments({
      status: "Published",
    });

    const problemsByDifficulty = await Problem.aggregate([
      { $match: { status: "Published" } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const difficultyCounts = {};
    problemsByDifficulty.forEach((item) => {
      difficultyCounts[item._id.toLowerCase()] = item.count;
    });

    const recentSubmissions = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("problem", "title difficulty")
      .select("problem status executionTime createdAt")
      .lean();

    const solvedByDifficulty = await Submission.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          status: "Accepted",
        },
      },
      {
        $group: {
          _id: "$problem",
          lastAccepted: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemDetails",
        },
      },
      { $unwind: "$problemDetails" },
      {
        $group: {
          _id: "$problemDetails.difficulty",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const solvedCounts = {};
    solvedByDifficulty.forEach((item) => {
      solvedCounts[item._id.toLowerCase()] = item.count;
    });

    res.json({
      user: {
        ...user,
        totalProblems: totalProblemsCount,
        problemsSolvedCount: user.problemsSolved.length,
        problemsAttemptedCount: user.problemsAttempted.length,
      },
      statistics: {
        problems: {
          total: totalProblemsCount,
          byDifficulty: difficultyCounts,
        },
        solved: {
          total: user.problemsSolved.length,
          byDifficulty: solvedCounts,
        },
        submissions: {
          total: user.totalSubmissions,
          successRate: user.successRate,
        },
      },
      recentActivity: recentSubmissions,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId)
      .select(
        "username problemsSolved problemsAttempted problemsUploaded totalSubmissions successRate createdAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userProfile = {
      ...user,
      problemsSolvedCount: user.problemsSolved.length,
      problemsAttemptedCount: user.problemsAttempted.length,
      problemsUploadedCount: user.problemsUploaded.length,
    };

    delete userProfile.problemsSolved;
    delete userProfile.problemsAttempted;
    delete userProfile.problemsUploaded;

    const totalProblems = await Problem.countDocuments({ status: "Published" });

    const solvedByDifficulty = await Problem.aggregate([
      {
        $match: {
          _id: { $in: user.problemsSolved },
          status: "Published",
        },
      },
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentlySolved = await Problem.find({
      _id: { $in: user.problemsSolved.slice(-5) },
      status: "Published",
    })
      .select("title difficulty")
      .sort({ _id: -1 })
      .limit(5)
      .lean();

    const uploadedProblems = await Problem.find({
      _id: { $in: user.problemsUploaded },
      status: "Published",
    })
      .select("title difficulty acceptance")
      .sort({ publishedDate: -1 })
      .limit(5)
      .lean();

    res.json({
      user: userProfile,
      stats: {
        totalProblems,
        solvedByDifficulty,
        progress: ((user.problemsSolved.length / totalProblems) * 100).toFixed(
          1
        ),
      },
      recentlySolved,
      uploadedProblems,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

exports.getUserSolvedProblems = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId).select("problemsSolved").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const solvedProblems = await Problem.find({
      _id: { $in: user.problemsSolved },
      status: "Published",
    })
      .select("id title difficulty acceptance")
      .sort({ id: 1 })
      .lean();

    res.json(solvedProblems);
  } catch (err) {
    console.error("Error fetching solved problems:", err);
    res.status(500).json({ error: "Failed to fetch solved problems." });
  }
};

exports.getUserAttemptedProblems = async (req, res) => {
  try {
    const targetUserId = req.params.id || req.user.userId;
    const currentUserId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    if (targetUserId !== currentUserId) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
      }
    }

    const user = await User.findById(targetUserId)
      .select("problemsAttempted problemsSolved")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const attemptedProblems = await Problem.find({
      _id: { $in: user.problemsAttempted },
      status: "Published",
    })
      .select("id title difficulty acceptance")
      .sort({ id: 1 })
      .lean();

    const solvedIds = user.problemsSolved.map((id) => id.toString());
    const problemsWithStatus = attemptedProblems.map((problem) => ({
      ...problem,
      solved: solvedIds.includes(problem._id.toString()),
    }));

    res.json(problemsWithStatus);
  } catch (err) {
    console.error("Error fetching attempted problems:", err);
    res.status(500).json({ error: "Failed to fetch attempted problems." });
  }
};

exports.getUserUploadedProblems = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId).select("problemsUploaded").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isCurrentUser = userId === req.user?.userId;
    const currentUser = isCurrentUser ? await User.findById(userId) : null;
    const isAdmin = currentUser?.role === "admin";

    const query = { _id: { $in: user.problemsUploaded } };
    if (!isCurrentUser && !isAdmin) {
      query.status = "Published";
    }

    const uploadedProblems = await Problem.find(query)
      .select("id title difficulty acceptance status publishedDate")
      .sort({ publishedDate: -1 })
      .lean();

    res.json(uploadedProblems);
  } catch (err) {
    console.error("Error fetching uploaded problems:", err);
    res.status(500).json({ error: "Failed to fetch uploaded problems." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          error:
            existingUser.username === username
              ? "Username already taken."
              : "Email already in use.",
        });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
};

// admin
exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { search, role, sort = "username", page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && ["user", "admin", "guest"].includes(role)) {
      query.role = role;
    }

    let sortOption = {};
    if (sort.startsWith("-")) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select(
        "username email role createdAt lastActive problemsSolved problemsAttempted"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalUsers = await User.countDocuments(query);

    const usersWithCounts = users.map((user) => ({
      ...user,
      solvedCount: user.problemsSolved.length,
      attemptedCount: user.problemsAttempted.length,
      problemsSolved: undefined,
      problemsAttempted: undefined,
    }));

    res.json({
      users: usersWithCounts,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalUsers / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!role || !["user", "admin", "guest"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const adminUser = await User.findById(adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    if (targetUserId === adminId) {
      return res.status(400).json({ error: "Cannot change your own role." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("username email role");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      message: `User role updated to ${role}.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role." });
  }
};
