const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["cpp", "java", "python", "javascript"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Pending",
      ],
      default: "Pending",
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    memoryUsed: {
      type: Number, // in KB
      default: 0,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    // Track test case results individually
    testResults: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        actualOutput: { type: String },
        passed: { type: Boolean },
        hidden: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster lookups by user/problem combination
submissionSchema.index({ user: 1, problem: 1 });

// Virtual for pass rate percentage
submissionSchema.virtual("passRate").get(function () {
  if (this.totalTestCases === 0) return 0;
  return (this.testCasesPassed / this.totalTestCases) * 100;
});

module.exports = mongoose.model("Submission", submissionSchema);
