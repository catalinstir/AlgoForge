import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import { User } from "../../App";
import "../../styles/ProblemDetail.css";

// Define Problem type
interface Problem {
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
  functionName: string;
  codeTemplates: {
    [key: string]: string;
  };
}

interface ProblemDetailProps {
  currentUser: User | null;
}

const ProblemDetail = ({ currentUser }: ProblemDetailProps) => {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      const mockProblem: Problem = {
        id: parseInt(problemId || "1"),
        title:
          problemId === "1"
            ? "Two Sum"
            : problemId === "2"
            ? "Add Two Numbers"
            : "Problem " + problemId,
        difficulty:
          problemId === "1"
            ? "Easy"
            : problemId === "2"
            ? "Medium"
            : problemId === "4" || problemId === "10"
            ? "Hard"
            : "Medium",
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
        
You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          {
            input: "nums = [3,2,4], target = 6",
            output: "[1,2]",
          },
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists.",
        ],
        uploadedBy: "admin",
        functionName: "twoSum",
        codeTemplates: {
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}`,
          python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        
        `,
        },
      };

      setProblem(mockProblem);
      setCode(mockProblem.codeTemplates[selectedLanguage]);
    }, 300);
  }, [problemId, selectedLanguage]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    if (problem) {
      setCode(problem.codeTemplates[newLanguage]);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput("");

    setTimeout(() => {
      setOutput(
        "Running test cases...\n\nTest Case 1: PASSED\nExpected: [0,1], Got: [0,1]\n\nTest Case 2: PASSED\nExpected: [1,2], Got: [1,2]\n\nAll test cases passed!"
      );
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!currentUser) {
      setOutput("Error: Please log in to submit your solution.");
      return;
    }

    setIsSubmitting(true);
    setOutput("");

    setTimeout(() => {
      setOutput(
        "Submitting solution...\n\nAccepted!\nRuntime: 4 ms, faster than 98.5% of C++ submissions.\nMemory Usage: 10.8 MB, less than 43.2% of C++ submissions."
      );
      setIsSubmitting(false);
    }, 2000);
  };

  if (!problem) {
    return (
      <div className="d-flex justify-content-center p-5 text-light">
        Loading problem...
      </div>
    );
  }

  return (
    <div className="problem-detail-container">
      <div className="row g-0">
        {/* Left Pane - Code Editor */}
        <div className="col-md-6 editor-pane">
          <div className="editor-header d-flex justify-content-between align-items-center p-3">
            <div className="language-select-container">
              <select
                className="form-select bg-dark text-light"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "Run"}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !currentUser}
                title={!currentUser ? "Please log in to submit" : ""}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          <div className="code-editor-container">
            <CodeEditor
              code={code}
              language={selectedLanguage}
              onChange={handleCodeChange}
            />
          </div>

          <div className="output-container">
            <div className="output-header">Output</div>
            <div className="output-content">
              {output ? (
                <pre>{output}</pre>
              ) : (
                <div className="text-muted">Run your code to see output</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane - Problem Description */}
        <div className="col-md-6 description-pane">
          <ProblemDescription problem={problem} />
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
