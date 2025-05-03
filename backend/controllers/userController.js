const User = require("../models/User");
const mongoose = require("mongoose");

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ error: "Not authorized, user ID missing." });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get total published problems count
    const totalProblems = await mongoose.model("Problem").countDocuments({
      status: "Published",
    });

    const transformedUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || "user",
      problemsSolvedCount: user.problemsSolved.length,
      problemsAttemptedCount: user.problemsAttempted.length,
      problemsUploadedCount: user.problemsUploaded.length,
      totalProblems: totalProblems, // Set actual problem count
    };

    res.json(transformedUser);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error while fetching user data." });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return only public information
    const publicUser = {
      username: user.username,
      problemsSolved: user.problemsSolved.length,
      problemsUploaded: user.problemsUploaded.length,
      successRate: user.successRate,
    };

    res.json(publicUser);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error while fetching user data." });
  }
};

// Get user's solved problems
exports.getUserSolvedProblems = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId)
      .populate("problemsSolved", "id title difficulty")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user.problemsSolved);
  } catch (err) {
    console.error("Error fetching solved problems:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching solved problems." });
  }
};

// Get user's attempted problems
exports.getUserAttemptedProblems = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate("problemsAttempted", "id title difficulty")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user.problemsAttempted);
  } catch (err) {
    console.error("Error fetching attempted problems:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching attempted problems." });
  }
};

// Get user's uploaded problems
exports.getUserUploadedProblems = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(userId)
      .populate("problemsUploaded", "id title difficulty")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user.problemsUploaded);
  } catch (err) {
    console.error("Error fetching uploaded problems:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching uploaded problems." });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    // Check if username or email are already taken
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

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
};

// Admin - Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { search, role, sort, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const sortOption = sort
      ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 }
      : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error while fetching users." });
  }
};

// Admin - Update user role
exports.updateUserRole = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    const admin = await User.findById(req.user.userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const userId = req.params.id;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    if (!role || !["guest", "user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role." });
  }
};
