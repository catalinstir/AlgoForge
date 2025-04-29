const express = require("express");
const router = express.Router();
const problemController = require("../controllers/problemController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", problemController.getAllProblems);
router.get("/categories", problemController.getCategories);
router.get("/:id", problemController.getProblemById);

router.post("/", authMiddleware, problemController.createProblem);
router.put("/:id", authMiddleware, problemController.updateProblem);
router.delete("/:id", authMiddleware, problemController.deleteProblem);
router.get("/:id/stats", authMiddleware, problemController.getProblemStats);

module.exports = router;
