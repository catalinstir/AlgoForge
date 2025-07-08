const mongoose = require("mongoose");

const problemRequestSchema = new mongoose.Schema(
  {
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    constraints: [
      {
        type: String,
      },
    ],
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    functionName: {
      type: String,
      required: true,
    },
    codeTemplates: {
      cpp: { type: String },
      java: { type: String },
      python: { type: String },
      javascript: { type: String },
    },
    fullSourceTemplates: {
      cpp: { type: String },
      java: { type: String },
      python: { type: String },
      javascript: { type: String },
    },
    solutionCode: {
      language: {
        type: String,
        enum: ["cpp", "java", "python", "javascript"],
        required: true,
      },
      code: { type: String, required: true },
    },
    categories: [
      {
        type: String,
      },
    ],
    suggestedIncludes: {
      cpp: [String],
      java: [String],
      python: [String],
      javascript: [String],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    feedback: {
      type: String,
    },
    approvedProblem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProblemRequest", problemRequestSchema);
