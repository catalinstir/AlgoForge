import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import ProblemDescription from "../../components/ProblemDescription";
import { User, Problem } from "../../types";
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
  const location = useLocation();
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
  const [showFullSource, setShowFullSource] = useState<boolean>(false); // Toggle for showing whole source
  const [validationError, setValidationError] = useState<string | null>(null);

  // Move all utility functions into the component

  // Extract Solution class from code
  const extractSolutionClass = (sourceCode: string): string | null => {
    // This regex looks for the Solution class definition
    const solutionClassRegex = /class\s+Solution\s*\{[\s\S]*?\};/;
    const match = sourceCode.match(solutionClassRegex);
    return match ? match[0] : null;
  };

  // Check if code contains a valid Solution class
  const validateSolutionClass = (sourceCode: string): boolean => {
    return !!extractSolutionClass(sourceCode);
  };

  // Check if code appears to be complete source with main function
  const isCompleteSource = (sourceCode: string): boolean => {
    return (
      sourceCode.includes("int main()") || sourceCode.includes("int main(")
    );
  };

  // Prepare code for submission
  const prepareSubmissionCode = (sourceCode: string): string => {
    // If already showing just the Solution class, use it directly
    if (!isCompleteSource(sourceCode)) {
      return sourceCode;
    }

    // If showing full source, extract just the Solution class
    const solutionClass = extractSolutionClass(sourceCode);
    return solutionClass || sourceCode; // Fall back to full code if extraction fails
  };

  useEffect(() => {
    if (problemId) {
      loadProblem();
    } else {
      setError("Problem ID is missing from the URL");
      setLoading(false);
    }
  }, [problemId, location]);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    setProblem(null);
    setShowFullSource(false);
    setValidationError(null);

    try {
      if (!problemId) {
        throw new Error("Problem ID is missing");
      }

      // Extract index from URL query parameters if available
      const searchParams = new URLSearchParams(location.search);
      const indexParam = searchParams.get("index");
      const displayIndex = indexParam ? parseInt(indexParam) : undefined;

      console.log(
        "Fetching problem with ID:",
        problemId,
        "Index:",
        displayIndex
      );
      const response = await problemAPI.getProblemById(problemId);
      console.log("Problem API response:", response);

      const fetchedProblem = response.data;
      // Ensure problem has both id and _id available
      if (fetchedProblem) {
        fetchedProblem.id = fetchedProblem.id || fetchedProblem._id;

        // Set the displayIndex from URL query parameter if available
        if (displayIndex !== undefined) {
          fetchedProblem.displayIndex = displayIndex;
        }
        // Otherwise try to extract a number from the problemId
        else if (fetchedProblem.displayIndex === undefined) {
          // Try to extract a number from the problemId (if it's a numeric string)
          const numericId = parseInt(problemId);
          if (!isNaN(numericId)) {
            fetchedProblem.displayIndex = numericId;
          }
        }
      }

      setProblem(fetchedProblem);

      // Select default language based on available templates
      if (fetchedProblem.codeTemplates) {
        const availableLanguages = Object.keys(fetchedProblem.codeTemplates);
        if (availableLanguages.length > 0) {
          const defaultLang = availableLanguages.includes("cpp")
            ? "cpp"
            : availableLanguages[0];
          setSelectedLanguage(defaultLang);
          setCode(fetchedProblem.codeTemplates[defaultLang]);
        } else {
          setCode(`// No template available\n// Start coding here`);
        }
      } else {
        setCode(`// No template available\n// Start coding here`);
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
    setValidationError(null);

    // Reset to template view when changing language
    setShowFullSource(false);

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
    // Clear validation error when code changes
    if (validationError) setValidationError(null);
  };

  // Toggle between showing just the template or the whole source
  const handleToggleSourceView = () => {
    // If currently showing full source, switch back to template/user code
    if (showFullSource) {
      // Try to extract the solution class first
      const solutionClass = extractSolutionClass(code);

      if (solutionClass) {
        // Use the extracted solution class if available
        setCode(solutionClass);
      } else if (
        problem?.codeTemplates &&
        problem.codeTemplates[selectedLanguage]
      ) {
        // Fall back to the template if extraction fails
        setCode(problem.codeTemplates[selectedLanguage]);
      }
    } else {
      // If currently showing template, switch to whole source
      if (problem?.wholeSource && problem.wholeSource[selectedLanguage]) {
        setCode(problem.wholeSource[selectedLanguage]);
      }
    }
    setShowFullSource(!showFullSource);
  };

  // Validate code before running or submitting
  const validateCode = (): boolean => {
    // If showing full source, extract solution class for validation
    if (showFullSource) {
      const solutionClass = extractSolutionClass(code);
      if (!solutionClass) {
        setValidationError(
          "Could not find a valid Solution class in your code."
        );
        return false;
      }
      return true;
    }

    // If already showing just the solution class/template
    if (!validateSolutionClass(code)) {
      setValidationError(
        "Your code must contain a Solution class. Please make sure it's properly formatted."
      );
      return false;
    }

    return true;
  };

  const handleRun = async () => {
    if (!problem) return;

    // Clear previous validation errors
    setValidationError(null);

    // Validate code before running
    if (!validateCode()) {
      return;
    }

    setIsRunning(true);
    setOutput("Running code...\n");
    setSubmissionResult(null);

    try {
      // Ensure we're using a valid problem ID
      const validProblemId = problem._id || problem.id;

      if (!validProblemId) {
        throw new Error("Problem ID is undefined");
      }

      // Prepare the code for submission
      const submissionCode = prepareSubmissionCode(code);

      const response = await submissionAPI.runCode({
        problemId: validProblemId.toString(),
        code: submissionCode,
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

    // Clear previous validation errors
    setValidationError(null);

    // Validate code before submitting
    if (!validateCode()) {
      return;
    }

    setIsSubmitting(true);
    setOutput("Submitting solution...\n");
    setSubmissionResult(null);

    try {
      // Ensure we're using a valid problem ID
      const validProblemId = problem._id || problem.id;

      if (!validProblemId) {
        throw new Error("Problem ID is undefined");
      }

      // Prepare the code for submission
      const submissionCode = prepareSubmissionCode(code);

      const response = await submissionAPI.submitSolution({
        problemId: validProblemId.toString(),
        code: submissionCode,
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
            <div className="d-flex">
              <div className="language-select-container me-2">
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

              {/* Toggle button to show/hide the whole source code */}
              {problem.wholeSource && problem.wholeSource[selectedLanguage] && (
                <button
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={handleToggleSourceView}
                  disabled={isRunning || isSubmitting}
                >
                  {showFullSource ? "Show Solution Only" : "View Full Source"}
                </button>
              )}
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

          {/* Validation error alert */}
          {validationError && (
            <div
              className="alert alert-danger m-2 p-2"
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              {validationError}
            </div>
          )}

          {/* Explanation about Solution-only submissions when viewing full source */}
          {showFullSource && (
            <div
              className="alert alert-info m-2 p-2"
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-info-circle me-1"></i>
              You're viewing the full source code for reference. When
              submitting, only your Solution class implementation will be used.
            </div>
          )}

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
