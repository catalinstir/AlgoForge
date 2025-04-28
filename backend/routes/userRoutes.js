const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, userController.getMe);

// Add other user-related routes here (e.g., update profile)

module.exports = router;
