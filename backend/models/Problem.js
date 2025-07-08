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
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    suggestedIncludes: {
      cpp: [String],
      java: [String], 
      python: [String],
      javascript: [String],
    },

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
    uniqueAttempts: {
      type: Number,
      default: 0,
    },
    uniqueSolvers: {
      type: Number,
      default: 0,
    },

    categories: [
      {
        type: String,
      },
    ],

    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

problemSchema.virtual("acceptanceRate").get(function () {
  if (this.totalSubmissions === 0) return "0%";
  const rate = (this.successfulSubmissions / this.totalSubmissions) * 100;
  return `${rate.toFixed(1)}%`;
});

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

problemSchema.pre("save", function (next) {
  this.calculateAcceptance();
  next();
});

problemSchema.post("save", function(doc) {
  console.log(`Problem "${doc.title}" saved with acceptance: ${doc.acceptance} (${doc.successfulSubmissions}/${doc.totalSubmissions})`);
});

problemSchema.index({ status: 1, difficulty: 1 });
problemSchema.index({ categories: 1 });
problemSchema.index({ totalSubmissions: -1 });
problemSchema.index({ acceptance: -1 });

module.exports = mongoose.model("Problem", problemSchema);
