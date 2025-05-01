import React from "react";
import { Problem } from "../types";

interface ProblemDescriptionProps {
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

  const renderDescription = (text: string) => {
    return text.split(/\n\s*\n/).map((paragraph, index) => (
      <p key={index} className="mb-3">
        {paragraph.trim()}
      </p>
    ));
  };

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

  // Format the author's username
  const formatAuthor = (author: any) => {
    if (!author) return "AlgoRush";
    if (typeof author === "string") return author;
    if (author.username) return author.username;
    return "Unknown";
  };

  // Get problem ID (using either id or _id)
  const problemId = problem._id || problem.id;

  // Use a numeric display ID if available, otherwise try to extract from the problemId
  let displayId;
  if (typeof problem.displayIndex === "number") {
    displayId = problem.displayIndex;
  } else if (typeof problem.id === "number") {
    displayId = problem.id;
  } else if (problemId) {
    // Try to extract a number from the problemId
    const match = problemId.toString().match(/\d+/);
    displayId = match ? parseInt(match[0]) : "#";
  } else {
    displayId = "#";
  }

  return (
    <div className="problem-description-container p-3">
      <div className="problem-header mb-4">
        <h2 className="problem-title mb-1">
          {displayId}. {problem.title}
        </h2>
        <div className="d-flex gap-2 align-items-center mt-2">
          <span
            className={`problem-difficulty badge ${getDifficultyColorClass(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          {problem.acceptance && (
            <span className="problem-acceptance badge bg-secondary">
              Acceptance: {problem.acceptance}
            </span>
          )}
          {problem.categories && problem.categories.length > 0 && (
            <div className="ms-2">
              {problem.categories.map((category, index) => (
                <span key={index} className="badge bg-info me-1">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="problem-content">
        <div className="description-section mb-4">
          {renderDescription(problem.description)}
        </div>

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

        {problem.constraints && problem.constraints.length > 0 && (
          <div className="constraints-section mb-4">
            <h5 className="mb-3">Constraints</h5>
            {renderConstraints(problem.constraints)}
          </div>
        )}

        {problem.functionName && (
          <div className="function-section mb-4">
            <h5 className="mb-3">Function Definition</h5>
            <div className="bg-dark p-3 rounded">
              <code>{selectedLanguageGuide(problem.functionName)}</code>
            </div>
          </div>
        )}

        <div className="metadata-section mt-4 pt-3 border-top border-secondary">
          <p className="uploaded-by text-muted small">
            Contributed by:{" "}
            <span className="contributor fw-bold">
              {formatAuthor(problem.author)}
            </span>
            {problem.publishedDate && (
              <span className="ms-2">
                on {new Date(problem.publishedDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const selectedLanguageGuide = (functionName: string) => {
  return `Implement the '${functionName}' function according to the problem description.\nMake sure your solution passes all test cases.`;
};

export default ProblemDescription;
