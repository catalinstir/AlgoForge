import React from "react";
import { Problem } from "../App"; // Import shared Problem type

interface ProblemPreviewProps {
  problem: Problem; // Use the shared Problem type
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

  return (
    // Added specific class for styling the preview card
    <div className="problem-preview-card">
      <div className="preview-header">
        <span className="preview-id">{problem.id}.</span>
        <span className="preview-title">{problem.title}</span>
        <span
          className={`preview-difficulty ${getDifficultyColorClass(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      </div>
      <div className="preview-description">{descriptionPreview}</div>
    </div>
  );
};

export default ProblemPreview;
