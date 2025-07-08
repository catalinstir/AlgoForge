import React from "react";
import { Problem } from "../types";

interface ProblemPreviewProps {
  problem: Problem;
}

const ProblemPreview = ({ problem }: ProblemPreviewProps) => {
  const getDifficultyColorClass = (
    difficulty: "Easy" | "Medium" | "Hard"
  ): string => {
    switch (difficulty) {
      case "Easy":
        return "text-success";
      case "Medium":
        return "text-warning";
      case "Hard":
        return "text-danger";
      default:
        return "";
    }
  };

  const descriptionPreview = problem.description
    ? problem.description.length > 150
      ? problem.description.substring(0, 150) + "..."
      : problem.description
    : "No description available.";

  let displayId;
  if (typeof problem.displayIndex === "number") {
    displayId = problem.displayIndex;
  } else if (typeof problem.id === "number") {
    displayId = problem.id;
  } else {
    displayId = "#";
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return "0";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="problem-preview-card">
      <div className="preview-header">
        <span className="preview-id">{displayId}.</span>
        <span className="preview-title">{problem.title}</span>
        <span
          className={`preview-difficulty ${getDifficultyColorClass(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      </div>
      
      {/* Main description - this is what users want to see in the preview */}
      <div className="preview-description">{descriptionPreview}</div>
      
      {/* Minimal stats section - only the most relevant info */}
      <div className="preview-stats mt-2 pt-2 border-top" style={{ borderColor: "#3a3a3a" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <small className="text-muted">
              <span className="text-success">{problem.acceptance || "0%"}</span> acceptance
            </small>
            {(problem.totalSubmissions || 0) > 0 && (
              <small className="text-muted">
                <span className="text-info">{formatNumber(problem.totalSubmissions || 0)}</span> submissions
              </small>
            )}
          </div>
          
          {/* Categories - show max 2 to keep it clean */}
          {problem.categories && problem.categories.length > 0 && (
            <div className="d-flex gap-1">
              {problem.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="badge bg-secondary"
                  style={{ fontSize: "0.6rem" }}
                >
                  {category}
                </span>
              ))}
              {problem.categories.length > 2 && (
                <span className="text-muted" style={{ fontSize: "0.6rem" }}>
                  +{problem.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPreview;
