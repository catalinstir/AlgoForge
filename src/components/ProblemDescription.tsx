interface ProblemDescriptionProps {
  problem: {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    examples: {
      input: string;
      output: string;
      explanation?: string;
    }[];
    constraints: string[];
    uploadedBy: string;
  };
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

  return (
    <div className="problem-description-container">
      <div className="problem-header">
        <h1 className="problem-title">
          {problem.id}. {problem.title}
        </h1>
        <span
          className={`problem-difficulty ${getDifficultyColorClass(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <div className="problem-content">
        <div className="description-section">
          <div className="markdown-content">
            {problem.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="examples-section">
          <h3>Examples</h3>
          {problem.examples.map((example, index) => (
            <div key={index} className="example-card">
              <div className="example-header">Example {index + 1}</div>
              <div className="example-body">
                <div className="example-input">
                  <strong>Input:</strong> {example.input}
                </div>
                <div className="example-output">
                  <strong>Output:</strong> {example.output}
                </div>
                {example.explanation && (
                  <div className="example-explanation">
                    <strong>Explanation:</strong> {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="constraints-section">
          <h3>Constraints</h3>
          <ul>
            {problem.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>

        <div className="metadata-section">
          <p className="uploaded-by">
            Contributed by:{" "}
            <span className="contributor">{problem.uploadedBy}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;
