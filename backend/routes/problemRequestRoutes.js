const express = require("express");
const router = express.Router();
const problemRequestController = require("../controllers/problemRequestController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", problemRequestController.submitProblemRequest);
router.get("/my-requests", problemRequestController.getUserProblemRequests);
router.get("/:id", problemRequestController.getProblemRequest);
router.put("/:id", problemRequestController.updateProblemRequest);
router.delete("/:id", problemRequestController.cancelProblemRequest);

router.get("/", problemRequestController.getAllProblemRequests);
router.put("/:id/review", problemRequestController.reviewProblemRequest);

module.exports = router;
