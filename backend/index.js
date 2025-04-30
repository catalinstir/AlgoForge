const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const problemRoutes = require("./routes/problemRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const problemRequestRoutes = require("./routes/problemRequestRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logger middleware in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/problem-requests", problemRequestRoutes);

// Simple route for checking if the server is running
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack);
  res.status(500).json({
    error: "Something went wrong on the server.",
    message: process.env.NODE_ENV === "development" ? err.message : null,
  });
});

// Production setup - serve static files from frontend build
if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build directory
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Send all other requests to the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // Development route catch-all to help identify mistyped routes
  app.use((req, res) => {
    res.status(404).json({
      error: `Route not found: ${req.method} ${req.url}`,
      availableRoutes: [
        "/api/auth/*",
        "/api/users/*",
        "/api/problems/*",
        "/api/submissions/*",
        "/api/problem-requests/*",
      ],
    });
  });
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/algorush";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (process.env.NODE_ENV !== "production") {
        console.log(`API available at http://localhost:${PORT}/api`);
      }
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Don't crash the server, just log the error
});
