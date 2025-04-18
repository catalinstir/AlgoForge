import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import { User, Problem } from "../../App"; // Import shared types
// import "../../styles/ProblemDetail.css"; // Ensure CSS is imported

// Mock function to fetch problem details by ID
const fetchProblemById = (id: number): Promise<Problem | null> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Find the problem in a mock dataset or generate based on ID
      const mockProblem: Problem | undefined = mockProblems.find(
        (p) => p.id === id
      ); // Use mockProblems from ProblemList or define here

      if (mockProblem) {
        // Enhance mock problem with details needed for this page
        const detailedProblem: Problem = {
          ...mockProblem,
          examples: [
            // Add examples if missing
            {
              input: `nums = [${id}, 7, 11, 15], target = ${id + 7}`,
              output: `[0, 1]`,
              explanation: `Because nums[0] + nums[1] == ${id + 7}.`,
            },
            {
              input: `nums = [3, 2, ${id + 2}], target = ${id + 4}`,
              output: `[1, 2]`,
            },
          ],
          constraints: [
            // Add constraints if missing
            `2 <= nums.length <= 10^${(id % 3) + 2}`,
            `-10^9 <= nums[i] <= 10^9`,
            `-10^9 <= target <= 10^9`,
            "Only one valid answer exists.",
          ],
          uploadedBy: "admin_" + id, // Add uploader if missing
          functionName: mockProblem.title.replace(/\s+/g, "").toLowerCase(), // Generate function name
          codeTemplates: {
            // Add templates if missing
            cpp: `// Problem ID: ${id}\n#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> ${mockProblem.title
              .replace(/\s+/g, "")
              .toLowerCase()}(std::vector<int>& nums, int target) {\n        // Write your C++ code here\n        return {};\n    }\n};`,
            java: `// Problem ID: ${id}\nimport java.util.*;\n\nclass Solution {\n    public int[] ${mockProblem.title
              .replace(/\s+/g, "")
              .toLowerCase()}(int[] nums, int target) {\n        // Write your Java code here\n        return new int[]{};\n    }\n}`,
            python: `# Problem ID: ${id}\nfrom typing import List\n\nclass Solution:\n    def ${mockProblem.title
              .replace(/\s+/g, "")
              .toLowerCase()}(self, nums: List[int], target: int) -> List[int]:\n        # Write your Python code here\n        pass\n        `,
          },
        };
        resolve(detailedProblem);
      } else {
        resolve(null); // Problem not found
      }
    }, 300);
  });
};

// Re-use mock problems from ProblemList for consistency
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

interface ProblemDetailProps {
  currentUser: User | null;
}

const ProblemDetails = ({ currentUser }: ProblemDetailProps) => {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp"); // Default to C++
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      setError(null);
      setOutput(""); // Clear previous output
      const id = parseInt(problemId || "1"); // Default to 1 if no ID
      if (isNaN(id)) {
        setError("Invalid Problem ID.");
        setLoading(false);
        return;
      }

      try {
        const fetchedProblem = await fetchProblemById(id);
        if (fetchedProblem && fetchedProblem.codeTemplates) {
          setProblem(fetchedProblem);
          // Set initial code based on selected language and fetched templates
          setCode(
            fetchedProblem.codeTemplates[selectedLanguage] ||
              "// Template not found for this language."
          );
        } else {
          setError("Problem not found or missing data.");
          setProblem(null); // Clear problem state
          setCode(""); // Clear code
        }
      } catch (err) {
        setError("Failed to load problem data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [problemId, selectedLanguage]); // Re-fetch if problemId changes OR language changes

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    // The useEffect hook will handle fetching/setting the new code template
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Running code...\n");

    // Simulate running code against examples
    setTimeout(() => {
      let runOutput = "Running test cases...\n";
      if (problem?.examples) {
        problem.examples.forEach((ex, index) => {
          // Simple mock logic: pass if code contains 'return'
          const pass = code.includes("return");
          runOutput += `\nTest Case ${index + 1}: ${
            pass ? "PASSED" : "FAILED"
          }\n`;
          runOutput += `Input: ${ex.input}\n`;
          runOutput += `Expected: ${ex.output}\n`;
          runOutput += `Got: ${pass ? ex.output : "Error/Wrong Answer"}\n`;
        });
        runOutput += `\n${
          code.includes("return")
            ? "All test cases passed!"
            : "Some test cases failed."
        }`;
      } else {
        runOutput += "\nNo examples found to run against.";
      }

      setOutput(runOutput);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!currentUser) {
      setOutput("Error: Please log in to submit your solution.");
      return; // Guest restriction
    }

    setIsSubmitting(true);
    setOutput("Submitting solution...\n");

    // Simulate submission process
    setTimeout(() => {
      // Simple mock logic: accept if code contains function name and 'return'
      const accepted =
        problem?.functionName &&
        code.includes(problem.functionName) &&
        code.includes("return");
      let submitOutput = "Submitting solution...\n\n";

      if (accepted) {
        submitOutput += `Accepted!\nRuntime: ${Math.floor(
          Math.random() * 50 + 2
        )} ms\nMemory Usage: ${(Math.random() * 10 + 8).toFixed(1)} MB`;
      } else {
        submitOutput += `Failed!\nReason: ${
          !code.includes("return")
            ? "Missing return statement"
            : "Incorrect logic"
        }`;
      }

      setOutput(submitOutput);
      setIsSubmitting(false);
    }, 2000);
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5 text-light">
        Loading problem...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-warning">
          Problem data could not be loaded.
        </div>
      </div>
    );
  }

  // Ensure problem has necessary fields before rendering components that need them
  if (!problem.examples || !problem.constraints || !problem.uploadedBy) {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-warning">
          Incomplete problem data. Cannot display details.
        </div>
      </div>
    );
  }

  return (
    // Use the specific container class for styling
    <div className="problem-detail-container">
      <div className="row g-0">
        {" "}
        {/* Use g-0 to remove gutters */}
        {/* Left Pane - Code Editor & Output */}
        <div className="col-lg-6 editor-pane d-flex flex-column">
          {" "}
          {/* Use lg for larger screens */}
          {/* Editor Header */}
          <div className="editor-header d-flex justify-content-between align-items-center p-2 flex-shrink-0">
            <div className="language-select-container">
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary" // Smaller select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                aria-label="Select Language"
              >
                {/* Dynamically list available languages from templates */}
                {problem.codeTemplates &&
                  Object.keys(problem.codeTemplates).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                {/* Fallback if no templates */}
                {!problem.codeTemplates && <option value="cpp">C++</option>}
              </select>
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-outline-primary btn-sm me-2" // Smaller button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
              >
                {isRunning ? "Running..." : "Run"}
              </button>
              <button
                className="btn btn-primary btn-sm" // Smaller button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning || !currentUser} // Disable if running, submitting, or guest
                title={!currentUser ? "Please log in to submit" : ""}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
          {/* Code Editor */}
          <div className="code-editor-wrapper flex-grow-1">
            {" "}
            {/* Make editor take remaining space */}
            <CodeEditor
              code={code}
              language={selectedLanguage}
              onChange={handleCodeChange}
            />
          </div>
          {/* Output Area */}
          <div className="output-container flex-shrink-0">
            {" "}
            {/* Fixed height */}
            <div className="output-header p-2">Output</div>
            <div className="output-content p-2">
              {output ? (
                <pre>{output}</pre>
              ) : (
                <div className="text-muted">
                  Run or submit your code to see output.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Pane - Problem Description */}
        {/* Ensure ProblemDescription component receives a valid problem object */}
        <div className="col-lg-6 description-pane">
          <ProblemDescription problem={problem} />
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;
