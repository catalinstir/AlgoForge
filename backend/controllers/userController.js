const User = require("../models/User");

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

    const transformedUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || "user",
      problemsSolved: 0,
      totalProblems: 10,
    };

    res.json(transformedUser);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error while fetching user data." });
  }
};
