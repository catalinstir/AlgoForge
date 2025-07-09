const express = require("express");
const router = express.Router();
const problemRequestController = require("../controllers/problemRequestController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// User routes
router.post("/", problemRequestController.submitProblemRequest);
router.get("/my-requests", problemRequestController.getUserProblemRequests);
router.get("/:id", problemRequestController.getProblemRequest);
router.put("/:id", problemRequestController.updateProblemRequest);
router.delete("/:id/cancel", problemRequestController.cancelProblemRequest);

// Admin routes
router.get("/", problemRequestController.getAllProblemRequests);
router.put("/:id/review", problemRequestController.reviewProblemRequest);
router.delete("/:id/delete", problemRequestController.deleteProblemRequest);

module.exports = router;
