const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. Invalid token format." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Server authentication error." });
  }
};
