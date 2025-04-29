import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import { User, Problem } from "../../App";
import { problemAPI, submissionAPI } from "../../services/api";

interface ProblemDetailsProps {
  currentUser: User | null;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  hidden?: boolean;
}

interface SubmissionResult {
  status: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults: TestResult[];
}

const ProblemDetails = ({ currentUser }: ProblemDetailsProps) => {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  useEffect(() => {
    loadProblem();
  }, [problemId]);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    setProblem(null);

    try {
      if (!problemId) {
        throw new Error("Problem ID is missing");
      }

      const response = await problemAPI.getProblemById(problemId);
      const fetchedProblem = response.data;

      setProblem(fetchedProblem);

      if (
        fetchedProblem.codeTemplates &&
        fetchedProblem.codeTemplates[selectedLanguage]
      ) {
        setCode(fetchedProblem.codeTemplates[selectedLanguage]);
      } else {
        setCode(
          `// No template available for ${selectedLanguage}\n// Start coding here`
        );
      }
    } catch (err: any) {
      console.error("Error loading problem:", err);
      setError(err.response?.data?.error || "Failed to load problem data");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);

    if (problem?.codeTemplates && problem.codeTemplates[newLanguage]) {
      setCode(problem.codeTemplates[newLanguage]);
    } else {
      setCode(
        `// No template available for ${newLanguage}\n// Start coding here`
      );
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRun = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput("Running code...\n");
    setSubmissionResult(null);

    try {
      const response = await submissionAPI.runCode({
        problemId: problem._id || problemId,
        code,
        language: selectedLanguage,
      });

      const result = response.data;
      setSubmissionResult(result);

      let runOutput = "Running test cases...\n\n";

      if (result.testResults && result.testResults.length > 0) {
        result.testResults.forEach((test: TestResult, index: number) => {
          runOutput += `Test Case ${index + 1}: ${
            test.passed ? "PASSED" : "FAILED"
          }\n`;
          runOutput += `Input: ${test.input}\n`;
          runOutput += `Expected: ${test.expectedOutput}\n`;
          runOutput += `Got: ${test.actualOutput}\n\n`;
        });

        runOutput += `\nSummary: ${result.testCasesPassed}/${result.totalTestCases} test cases passed\n`;
        runOutput += `Execution Time: ${result.executionTime}ms\n`;
        runOutput += `Memory Used: ${result.memoryUsed}KB\n`;
      } else {
        runOutput += "No test results returned.";
      }

      setOutput(runOutput);
    } catch (err: any) {
      console.error("Error running code:", err);
      setOutput(
        `Error running code: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    if (!currentUser) {
      setOutput("Error: Please log in to submit your solution.");
      return;
    }

    setIsSubmitting(true);
    setOutput("Submitting solution...\n");
    setSubmissionResult(null);

    try {
      const response = await submissionAPI.submitSolution({
        problemId: problem._id || problemId,
        code,
        language: selectedLanguage,
      });

      const result = response.data;
      setSubmissionResult(result.submission);

      let submitOutput = "Submission results:\n\n";

      submitOutput += `Status: ${result.submission.status}\n`;
      submitOutput += `Passed: ${result.submission.testCasesPassed}/${result.submission.totalTestCases} test cases\n`;
      submitOutput += `Execution Time: ${result.submission.executionTime}ms\n`;
      submitOutput += `Memory Used: ${result.submission.memoryUsed}KB\n\n`;

      if (result.testResults && result.testResults.length > 0) {
        submitOutput += "Test Case Details:\n";
        result.testResults.forEach((test: TestResult, index: number) => {
          submitOutput += `\nTest Case ${index + 1}: ${
            test.passed ? "PASSED" : "FAILED"
          }\n`;
          submitOutput += `Input: ${test.input}\n`;
          submitOutput += `Expected: ${test.expectedOutput}\n`;
          submitOutput += `Got: ${test.actualOutput}\n`;
        });
      }

      if (result.submission.status === "Accepted") {
        submitOutput += "\nCongratulations! Your solution was accepted!";
      } else {
        submitOutput +=
          "\nYour solution was not accepted. Please check the test cases and try again.";
      }

      setOutput(submitOutput);
    } catch (err: any) {
      console.error("Error submitting solution:", err);
      setOutput(
        `Error submitting solution: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5 text-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading problem...</span>
        </div>
        <span className="ms-3">Loading problem...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={loadProblem}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-warning">
          <h4 className="alert-heading">Problem Not Found</h4>
          <p>The requested problem could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-detail-container">
      <div className="row g-0">
        <div className="col-lg-6 editor-pane d-flex flex-column">
          <div className="editor-header d-flex justify-content-between align-items-center p-2 flex-shrink-0">
            <div className="language-select-container">
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                aria-label="Select Language"
                disabled={isRunning || isSubmitting}
              >
                {problem.codeTemplates &&
                  Object.keys(problem.codeTemplates).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                {!problem.codeTemplates && <option value="cpp">C++</option>}
              </select>
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
              >
                {isRunning ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Running...
                  </>
                ) : (
                  "Run"
                )}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning || !currentUser}
                title={!currentUser ? "Please log in to submit" : ""}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>

          <div className="code-editor-wrapper flex-grow-1">
            <CodeEditor
              code={code}
              language={selectedLanguage}
              onChange={handleCodeChange}
            />
          </div>

          <div className="output-container flex-shrink-0">
            <div className="output-header p-2 d-flex justify-content-between align-items-center">
              <span>Output</span>
              {submissionResult && (
                <span
                  className={`badge ${
                    submissionResult.status === "Accepted"
                      ? "bg-success"
                      : submissionResult.status === "All Tests Passed"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {submissionResult.status}
                </span>
              )}
            </div>
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

        <div className="col-lg-6 description-pane">
          <ProblemDescription problem={problem} />
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;
