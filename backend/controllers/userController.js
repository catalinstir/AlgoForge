const User = require("../models/User");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const ProblemRequest = require("../models/ProblemRequest");
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

    const totalProblems = await mongoose.model("Problem").countDocuments({
      status: "Published",
    });

    const problemsByDifficulty = await mongoose.model("Problem").aggregate([
      { $match: { status: "Published" } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);

    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    problemsByDifficulty.forEach(item => {
      if (item._id && difficultyBreakdown.hasOwnProperty(item._id)) {
        difficultyBreakdown[item._id] = item.count;
      }
    });

    const transformedUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || "user",
      problemsSolvedCount: user.problemsSolved.length,
      problemsAttemptedCount: user.problemsAttempted.length,
      problemsUploadedCount: user.problemsUploaded.length,
      totalProblems: totalProblems,
      successRate: user.successRate || 0,
      solvedByDifficulty: user.solvedByDifficulty || { Easy: 0, Medium: 0, Hard: 0 },
      problemsByDifficulty: difficultyBreakdown,
      createdAt: user.createdAt,
    };

    res.json(transformedUser);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error while fetching user data." });
  }
};

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

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

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

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized." });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required to delete account." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount === 1) {
        return res.status(400).json({ 
          error: "Cannot delete account. You are the only admin. Please assign another admin first." 
        });
      }
    }

    console.log(`Starting account deletion for user: ${user.username} (${userId})`);

    try {
      const isReplicaSet = process.env.MONGODB_REPLICA_SET === 'true' || 
                          process.env.NODE_ENV === 'production';

      if (isReplicaSet) {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          await performAccountDeletion(user, userId, session);
        });
        await session.endSession();
      } else {
        await performAccountDeletion(user, userId, null);
      }

      console.log(`Account deletion completed successfully for user: ${user.username}`);
      
      res.json({ 
        message: "Account deleted successfully. You will be logged out." 
      });

    } catch (deletionError) {
      console.error("Error during account deletion:", deletionError);
      res.status(500).json({ 
        error: "Failed to delete account due to a database error. Please try again." 
      });
    }

  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account." });
  }
};

async function performAccountDeletion(user, userId, session = null) {
  const sessionOptions = session ? { session } : {};

  const deletedSubmissions = await Submission.deleteMany({ user: userId }, sessionOptions);
  console.log(`Deleted ${deletedSubmissions.deletedCount} submissions`);

  const deletedRequests = await ProblemRequest.deleteMany({ submitter: userId }, sessionOptions);
  console.log(`Deleted ${deletedRequests.deletedCount} problem requests`);

  const userProblems = await Problem.find({ author: userId }, null, sessionOptions);
  if (userProblems.length > 0) {
    console.log(`Found ${userProblems.length} problems uploaded by user`);
    
    const firstAdmin = await User.findOne({ 
      role: "admin", 
      _id: { $ne: userId } 
    }, null, sessionOptions);
    
    if (firstAdmin) {
      await Problem.updateMany(
        { author: userId },
        { $set: { author: firstAdmin._id } },
        sessionOptions
      );
      
      await User.findByIdAndUpdate(
        firstAdmin._id,
        { $addToSet: { problemsUploaded: { $each: userProblems.map(p => p._id) } } },
        sessionOptions
      );
      
      console.log(`Transferred ${userProblems.length} problems to admin: ${firstAdmin.username}`);
    } else {
      await Problem.deleteMany({ author: userId }, sessionOptions);
      console.log(`Deleted ${userProblems.length} problems (no admin to transfer to)`);
    }
  }

  const userUpdateResult = await User.updateMany(
    {},
    { 
      $pull: { 
        problemsAttempted: { $in: user.problemsAttempted },
        problemsSolved: { $in: user.problemsSolved }
      }
    },
    sessionOptions
  );
  console.log(`Updated ${userUpdateResult.modifiedCount} other users to remove references`);

  for (const problemId of user.problemsSolved) {
    try {
      const problem = await Problem.findById(problemId, null, sessionOptions);
      if (problem) {
        problem.uniqueSolvers = Math.max(0, (problem.uniqueSolvers || 1) - 1);
        await problem.save(sessionOptions);
      }
    } catch (problemError) {
      console.warn(`Could not update problem ${problemId}:`, problemError.message);
    }
  }

  for (const problemId of user.problemsAttempted) {
    try {
      const problem = await Problem.findById(problemId, null, sessionOptions);
      if (problem) {
        // Decrease unique attempts count
        problem.uniqueAttempts = Math.max(0, (problem.uniqueAttempts || 1) - 1);
        await problem.save(sessionOptions);
      }
    } catch (problemError) {
      console.warn(`Could not update problem ${problemId}:`, problemError.message);
    }
  }

  await User.findByIdAndDelete(userId, sessionOptions);
  console.log(`Deleted user account: ${user.username}`);
}

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
