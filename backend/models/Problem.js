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
    
    // Statistics tracking
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    successfulSubmissions: {
      type: Number,
      default: 0,
    },
    uniqueAttempts: {
      type: Number,
      default: 0,
    },
    uniqueSolvers: {
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

// Method to recalculate acceptance rate
problemSchema.methods.calculateAcceptance = function() {
  const totalSubmissions = this.totalSubmissions || 0;
  const successfulSubmissions = this.successfulSubmissions || 0;
  
  if (totalSubmissions === 0) {
    this.acceptance = "0%";
  } else {
    const rate = (successfulSubmissions / totalSubmissions) * 100;
    this.acceptance = `${rate.toFixed(1)}%`;
  }
  
  return this.acceptance;
};

// Pre-save middleware to update acceptance field
problemSchema.pre("save", function (next) {
  // Always recalculate acceptance when saving
  this.calculateAcceptance();
  next();
});

// Post-save middleware for logging (optional)
problemSchema.post("save", function(doc) {
  console.log(`Problem "${doc.title}" saved with acceptance: ${doc.acceptance} (${doc.successfulSubmissions}/${doc.totalSubmissions})`);
});

// Index for faster queries
problemSchema.index({ status: 1, difficulty: 1 });
problemSchema.index({ categories: 1 });
problemSchema.index({ totalSubmissions: -1 });
problemSchema.index({ acceptance: -1 });

module.exports = mongoose.model("Problem", problemSchema);
