import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProblemPreview from "./ProblemPreview"; // Import ProblemPreview
import { Problem } from "../App"; // Import the shared Problem type

// Mock data for problems (replace with actual API call later)
const mockProblems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    acceptance: "47.5%",
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    description:
      "You are given two non-empty linked lists representing two non-negative integers.",
    acceptance: "38.2%",
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    acceptance: "33.1%",
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    acceptance: "34.0%",
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    description:
      "Given a string s, return the longest palindromic substring in s.",
    acceptance: "30.5%",
  },
  {
    id: 6,
    title: "Zigzag Conversion",
    difficulty: "Medium",
    description:
      'The string "PAYPALISHIRING" is written in a zigzag pattern...',
    acceptance: "40.1%",
  },
  {
    id: 7,
    title: "Reverse Integer",
    difficulty: "Easy",
    description:
      "Given a signed 32-bit integer x, return x with its digits reversed.",
    acceptance: "27.3%",
  },
  {
    id: 8,
    title: "String to Integer (atoi)",
    difficulty: "Medium",
    description:
      "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.",
    acceptance: "16.2%",
  },
  {
    id: 9,
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is palindrome integer.",
    acceptance: "51.9%",
  },
  {
    id: 10,
    title: "Regular Expression Matching",
    difficulty: "Hard",
    description:
      "Given an input string (s) and a pattern (p), implement regular expression matching with support for '.' and '*'.",
    acceptance: "28.0%",
  },
];

const ProblemList = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProblemId, setHoveredProblemId] = useState<number | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setProblems(mockProblems);
      setLoading(false);
    }, 500); // Simulate network delay
  }, []);

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

  if (loading) {
    return (
      <div className="text-center text-light p-5">Loading problems...</div>
    );
  }

  return (
    <div className="problems-container">
      <h2 className="text-light mb-4">Problems</h2>
      {/* Optional: Add filters for difficulty, status, search here */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Acceptance</th>
              {/* Add more columns like Status if needed */}
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr
                key={problem.id}
                className="problem-row"
                onMouseEnter={() => setHoveredProblemId(problem.id)}
                onMouseLeave={() => setHoveredProblemId(null)}
                style={{ position: "relative" }} // Needed for absolute positioning of preview
              >
                <td>{problem.id}</td>
                <td>
                  <Link
                    to={`/problem/${problem.id}`}
                    className="problem-title-link"
                  >
                    {problem.title}
                  </Link>
                  {/* Hover Preview - Absolutely Positioned */}
                  {hoveredProblemId === problem.id && (
                    <div className="problem-hover-preview">
                      <ProblemPreview problem={problem} />
                    </div>
                  )}
                </td>
                <td>
                  <span className={getDifficultyColorClass(problem.difficulty)}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>{problem.acceptance || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
