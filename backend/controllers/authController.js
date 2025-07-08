const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error("JWT_SECRET environment variable is not set!");
    throw new Error("JWT_SECRET must be configured in environment variables");
  }
  
  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
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

    const user = new User({
      username,
      email,
      password,
      role: "user",
    });

    await user.save();

    const token = generateToken(user._id);

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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);

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

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

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

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.userId;

  try {
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

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
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
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
};
