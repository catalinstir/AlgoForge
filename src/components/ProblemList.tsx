import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ProblemList.css";
import ProblemPreview from "./ProblemPreview";

type Difficulty = "Easy" | "Medium" | "Hard";
interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  description: string;
}

const ProblemList = () => {
  const allProblems: Problem[] = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      acceptanceRate: 47.5,
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    },
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      acceptanceRate: 38.2,
      description:
        "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      acceptanceRate: 33.8,
      description:
        "Given a string s, find the length of the longest substring without repeating characters.",
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      acceptanceRate: 35.1,
      description:
        "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    },
    {
      id: 5,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      acceptanceRate: 31.7,
      description:
        "Given a string s, return the longest palindromic substring in s.",
    },
    {
      id: 6,
      title: "Zigzag Conversion",
      difficulty: "Medium",
      acceptanceRate: 42.3,
      description:
        "The string 'PAYPALISHIRING' is written in a zigzag pattern on a given number of rows. Write the code that will take a string and make this conversion.",
    },
    {
      id: 7,
      title: "Reverse Integer",
      difficulty: "Medium",
      acceptanceRate: 26.9,
      description:
        "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, then return 0.",
    },
    {
      id: 8,
      title: "String to Integer (atoi)",
      difficulty: "Medium",
      acceptanceRate: 16.1,
      description:
        "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer (similar to C/C++'s atoi function).",
    },
    {
      id: 9,
      title: "Palindrome Number",
      difficulty: "Easy",
      acceptanceRate: 52.3,
      description:
        "Given an integer x, return true if x is a palindrome, and false otherwise.",
    },
    {
      id: 10,
      title: "Regular Expression Matching",
      difficulty: "Hard",
      acceptanceRate: 28.4,
      description:
        "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
    },
  ];

  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "All">(
    "All"
  );
  const [hoveredProblem, setHoveredProblem] = useState<Problem | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });

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

  const handleMouseEnter = (problem: Problem, e: React.MouseEvent) => {
    setHoveredProblem(problem);

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    setPreviewPosition({
      top: rect.top + scrollTop,
      left: rect.right + 20,
    });
  };

  const handleMouseLeave = () => {
    setHoveredProblem(null);
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
              <tr
                key={problem.id}
                className="problem-row"
                onMouseEnter={(e) => handleMouseEnter(problem, e)}
                onMouseLeave={handleMouseLeave}
              >
                <td>{problem.id}</td>
                <td className="problem-title">
                  <Link to={`/problem/${problem.id}`} className="problem-link">
                    {problem.title}
                  </Link>
                </td>
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

      {/* problem prev popup */}
      {hoveredProblem && (
        <div
          className="problem-preview-container"
          style={{
            position: "absolute",
            top: `${previewPosition.top}px`,
            left: `${previewPosition.left}px`,
            zIndex: 1000,
          }}
        >
          <ProblemPreview problem={hoveredProblem} />
        </div>
      )}
    </div>
  );
};

export default ProblemList;
