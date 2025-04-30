const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Extended token expiration to 7 days
  });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already in use."
            : "Username already taken.",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: "user", // Default role
    });

    await user.save();

    // Generate token for immediate login after registration
    const token = generateToken(user._id);

    // Return user data (excluding password) and token
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      error: "Registration failed. Please try again later.",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password) and token
    const userData = user.toObject();
    delete userData.password;

    res.json({
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Login failed. Please try again later.",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user with counts but without password
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get count of problems
    const problemCounts = {
      totalProblems: await mongoose
        .model("Problem")
        .countDocuments({ status: "Published" }),
      attemptedCount: user.problemsAttempted.length,
      solvedCount: user.problemsSolved.length,
      uploadedCount: user.problemsUploaded.length,
    };

    res.json({
      ...user,
      ...problemCounts,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

// Update the user's profile
exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.userId;

  try {
    // Check if username or email are already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
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

    // Update user fields
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
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
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
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
};
