interface ProblemPreviewProps {
  problem: {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
  };
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

  return (
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
      <div className="preview-description">
        {problem.description.length > 200
          ? problem.description.substring(0, 200) + "..."
          : problem.description}
      </div>
    </div>
  );
};

export default ProblemPreview;
