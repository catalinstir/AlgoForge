import React from "react";
import { Problem } from "../App"; // Import shared Problem type

interface ProblemDescriptionProps {
  // Ensure the problem prop matches the detailed Problem type
  problem: Problem;
}

const ProblemDescription = ({ problem }: ProblemDescriptionProps) => {
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

  // Basic Markdown-like rendering for paragraphs
  const renderDescription = (text: string) => {
    // Split by double newline for paragraphs, trim whitespace
    return text.split(/\n\s*\n/).map((paragraph, index) => (
      <p key={index} className="mb-3">
        {paragraph.trim()}
      </p>
    ));
  };

  // Render constraints as a list
  const renderConstraints = (constraints: string[]) => {
    return (
      <ul className="list-unstyled">
        {constraints.map((constraint, index) => (
          <li key={index} className="mb-1">
            <code>{constraint}</code>
          </li>
        ))}
      </ul>
    );
  };

  return (
    // Added padding and scroll handling if needed
    <div className="problem-description-container p-3">
      {/* Problem Header */}
      <div className="problem-header mb-4">
        <h2 className="problem-title mb-1">
          {problem.id}. {problem.title}
        </h2>
        <span
          className={`problem-difficulty badge ${getDifficultyColorClass(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* Problem Content */}
      <div className="problem-content">
        {/* Description Section */}
        <div className="description-section mb-4">
          {/* Render description using the helper function */}
          {renderDescription(problem.description)}
        </div>

        {/* Examples Section */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="examples-section mb-4">
            <h5 className="mb-3">Examples</h5>
            {problem.examples.map((example, index) => (
              <div
                key={index}
                className="example-card bg-dark p-3 rounded mb-3"
              >
                <strong className="d-block mb-2">Example {index + 1}:</strong>
                <div className="example-io mb-2">
                  <pre className="mb-1">
                    <strong>Input:</strong> {example.input}
                  </pre>
                  <pre className="mb-0">
                    <strong>Output:</strong> {example.output}
                  </pre>
                </div>
                {example.explanation && (
                  <div className="example-explanation text-muted small">
                    <strong>Explanation:</strong> {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints Section */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="constraints-section mb-4">
            <h5 className="mb-3">Constraints</h5>
            {renderConstraints(problem.constraints)}
          </div>
        )}

        {/* Metadata Section */}
        {problem.uploadedBy && (
          <div className="metadata-section mt-4 pt-3 border-top border-secondary">
            <p className="uploaded-by text-muted small">
              Contributed by:{" "}
              <span className="contributor fw-bold">{problem.uploadedBy}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDescription;
