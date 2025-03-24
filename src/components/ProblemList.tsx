import { useState } from "react";
import "../styles/ProblemList.css";

type Difficulty = "Easy" | "Medium" | "Hard";
interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptanceRate: number;
}
const ProblemList = () => {
  const allProblems: Problem[] = [
    { id: 1, title: "Two Sum", difficulty: "Easy", acceptanceRate: 47.5 },
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      acceptanceRate: 38.2,
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      acceptanceRate: 33.8,
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      acceptanceRate: 35.1,
    },
    {
      id: 5,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      acceptanceRate: 31.7,
    },
    {
      id: 6,
      title: "Zigzag Conversion",
      difficulty: "Medium",
      acceptanceRate: 42.3,
    },
    {
      id: 7,
      title: "Reverse Integer",
      difficulty: "Medium",
      acceptanceRate: 26.9,
    },
    {
      id: 8,
      title: "String to Integer (atoi)",
      difficulty: "Medium",
      acceptanceRate: 16.1,
    },
    {
      id: 9,
      title: "Palindrome Number",
      difficulty: "Easy",
      acceptanceRate: 52.3,
    },
    {
      id: 10,
      title: "Regular Expression Matching",
      difficulty: "Hard",
      acceptanceRate: 28.4,
    },
  ];
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "All">(
    "All"
  );

  const filteredProblems =
    difficultyFilter === "All"
      ? allProblems
      : allProblems.filter(
          (problem) => problem.difficulty === difficultyFilter
        );

  const getDifficultyColorClass = (difficulty: Difficulty): string => {
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
    <div className="problems-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light">Problems</h2>
        <div className="difficulty-filter">
          <div
            className="btn-group"
            role="group"
            aria-label="Difficulty filter"
          >
            <button
              type="button"
              className={`btn ${
                difficultyFilter === "All"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setDifficultyFilter("All")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${
                difficultyFilter === "Easy"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setDifficultyFilter("Easy")}
            >
              Easy
            </button>
            <button
              type="button"
              className={`btn ${
                difficultyFilter === "Medium"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setDifficultyFilter("Medium")}
            >
              Medium
            </button>
            <button
              type="button"
              className={`btn ${
                difficultyFilter === "Hard"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setDifficultyFilter("Hard")}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => (
              <tr key={problem.id} className="problem-row">
                <td>{problem.id}</td>
                <td className="problem-title">{problem.title}</td>
                <td>
                  <span className={getDifficultyColorClass(problem.difficulty)}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>{problem.acceptanceRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
