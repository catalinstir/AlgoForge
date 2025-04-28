import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "prismjs/themes/prism-tomorrow.css";

import "./styles/App.css";
import "./styles/ProblemList.css";
import "./styles/ProblemDetail.css";
import "./styles/CodeEditor.css";
import "./styles/ProblemPreview.css";
import "./styles/AdminDashboard.css";

import AppContent from "./App.tsx";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
} else {
  console.error("Failed to find the root element with ID 'root'.");
}
