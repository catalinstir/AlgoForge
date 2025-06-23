const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/submit", submissionController.submitSolution);
router.post("/run", submissionController.runCode);
router.get("/", submissionController.getUserSubmissions);
router.get("/:id", submissionController.getSubmission);

// Existing route for getting submissions for a specific problem (admin only)
router.get("/problem/:problemId", submissionController.getProblemSubmissions);

// NEW ROUTES for admin functionality
router.get("/admin/all", submissionController.getAllSubmissions);
router.get("/admin/details/:id", submissionController.getSubmissionDetails);
router.delete("/admin/:id", submissionController.deleteSubmission);

module.exports = router;
