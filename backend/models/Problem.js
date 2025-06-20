const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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
    acceptance: {
      type: String,
      default: "0%",
    },
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    // Input/Output format description for users
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    // Suggested includes/imports as comments - optional hints for users
    suggestedIncludes: {
      cpp: [String],
      java: [String], 
      python: [String],
      javascript: [String],
    },

    // Problem metadata
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Pending", "Published", "Rejected"],
      default: "Draft",
    },
    publishedDate: {
      type: Date,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    successfulSubmissions: {
      type: Number,
      default: 0,
    },

    // Categories/tags for browsing
    categories: [
      {
        type: String,
      },
    ],

    // Admin feedback for rejected problems
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating acceptance rate
problemSchema.virtual("acceptanceRate").get(function () {
  if (this.totalSubmissions === 0) return "0%";
  const rate = (this.successfulSubmissions / this.totalSubmissions) * 100;
  return `${rate.toFixed(1)}%`;
});

// Update acceptance field before saving
problemSchema.pre("save", function (next) {
  if (
    this.isModified("totalSubmissions") ||
    this.isModified("successfulSubmissions")
  ) {
    if (this.totalSubmissions > 0) {
      const rate = (this.successfulSubmissions / this.totalSubmissions) * 100;
      this.acceptance = `${rate.toFixed(1)}%`;
    }
  }
  next();
});

module.exports = mongoose.model("Problem", problemSchema);
