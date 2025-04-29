const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile/:id", userController.getUserById);
router.get("/solved/:id", userController.getUserSolvedProblems);
router.get("/uploaded/:id", userController.getUserUploadedProblems);

router.get("/me", authMiddleware, userController.getMe);
router.get("/my-solved", authMiddleware, userController.getUserSolvedProblems);
router.get(
  "/my-attempted",
  authMiddleware,
  userController.getUserAttemptedProblems
);
router.get(
  "/my-uploaded",
  authMiddleware,
  userController.getUserUploadedProblems
);
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.put("/change-password", authMiddleware, userController.changePassword);

// Admin routes
router.get("/all", authMiddleware, userController.getAllUsers);
router.put("/:id/role", authMiddleware, userController.updateUserRole);

module.exports = router;
