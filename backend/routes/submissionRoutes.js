const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/submit", submissionController.submitSolution);
router.post("/run", submissionController.runCode);
router.get("/", submissionController.getUserSubmissions);
router.get("/:id", submissionController.getSubmission);

router.get("/problem/:problemId", submissionController.getProblemSubmissions);

router.get("/admin/all", submissionController.getAllSubmissions);
router.get("/admin/details/:id", submissionController.getSubmissionDetails);
router.delete("/admin/:id", submissionController.deleteSubmission);

module.exports = router;
