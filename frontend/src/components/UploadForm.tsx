import React, { useState } from "react";
import { problemRequestAPI } from "../services/api";
import CodeEditor from "../components/CodeEditor";

interface ProblemUploadFormProps {
  onSuccess?: (requestId: string) => void;
}

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
}

const ProblemUploadForm = ({ onSuccess }: ProblemUploadFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    description: "",
    inputFormat: "",
    outputFormat: "",
    categories: [] as string[],
  });

  const [examples, setExamples] = useState<Example[]>([
    { input: "", output: "", explanation: "" },
  ]);
  const [constraints, setConstraints] = useState<string[]>([""]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", output: "", isHidden: false },
  ]);
  const [solutionCode, setSolutionCode] = useState({
    language: "cpp",
    code: `// Write your complete solution here\n\nint main() {\n    \n    return 0;\n}`,
  });
  
  const [suggestedIncludes, setSuggestedIncludes] = useState({
    cpp: [] as string[],
    java: [] as string[],
    python: [] as string[],
    javascript: [] as string[],
  });

  const [includeInputs, setIncludeInputs] = useState({
    cpp: "",
    java: "",
    python: "",
    javascript: "",
  });

  const [currentIncludeLanguage, setCurrentIncludeLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [categoryInput, setCategoryInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExampleChange = (
    index: number,
    field: keyof Example,
    value: string
  ) => {
    const updatedExamples = [...examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setExamples(updatedExamples);
  };

  const addExample = () => {
    setExamples([...examples, { input: "", output: "", explanation: "" }]);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleConstraintChange = (index: number, value: string) => {
    const updatedConstraints = [...constraints];
    updatedConstraints[index] = value;
    setConstraints(updatedConstraints);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Easy" || value === "Medium" || value === "Hard") {
      setFormData((prev) => ({ ...prev, difficulty: value }));
    }
  };

  const addConstraint = () => {
    setConstraints([...constraints, ""]);
  };

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: any
  ) => {
    const updatedTestCases = [...testCases];

    if (field === "isHidden") {
      updatedTestCases[index] = {
        ...updatedTestCases[index],
        [field]: !updatedTestCases[index].isHidden,
      };
    } else {
      updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    }

    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isHidden: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSolutionLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSolutionCode((prev) => ({ ...prev, language: e.target.value }));
  };

  const handleSolutionCodeChange = (newCode: string) => {
    setSolutionCode((prev) => ({ ...prev, code: newCode }));
  };

  const addSuggestedInclude = (language: keyof typeof suggestedIncludes) => {
    const input = includeInputs[language].trim();
    if (input && !suggestedIncludes[language].includes(input)) {
      setSuggestedIncludes(prev => ({
        ...prev,
        [language]: [...prev[language], input]
      }));
      setIncludeInputs(prev => ({
        ...prev,
        [language]: ""
      }));
    }
  };

  const removeSuggestedInclude = (language: keyof typeof suggestedIncludes, index: number) => {
    setSuggestedIncludes(prev => ({
      ...prev,
      [language]: prev[language].filter((_, i) => i !== index)
    }));
  };

  const handleIncludeInputChange = (language: keyof typeof includeInputs, value: string) => {
    setIncludeInputs(prev => ({
      ...prev,
      [language]: value
    }));
  };

  const handleAddCategory = () => {
    if (
      categoryInput.trim() !== "" &&
      !formData.categories.includes(categoryInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => prev + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError("Title is required");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Description is required");
          return false;
        }
        if (!formData.inputFormat.trim()) {
          setError("Input format is required");
          return false;
        }
        if (!formData.outputFormat.trim()) {
          setError("Output format is required");
          return false;
        }
        if (formData.categories.length === 0) {
          setError("At least one category is required");
          return false;
        }
        return true;

      case 2:
        for (const example of examples) {
          if (!example.input.trim() || !example.output.trim()) {
            setError("Each example must have both input and output");
            return false;
          }
        }
        if (constraints.some((c) => !c.trim())) {
          setError("All constraints must be filled or removed");
          return false;
        }
        return true;

      case 3:
        for (const testCase of testCases) {
          if (!testCase.input.trim() || !testCase.output.trim()) {
            setError("Each test case must have both input and output");
            return false;
          }
        }
        return true;

      case 4:
        if (!solutionCode.code.trim()) {
          setError("Solution code is required");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log("=== SUBMIT ATTEMPT ===");
  console.log("Current step:", step);
  
  if (!validateCurrentStep()) {
    console.log("Validation failed at step", step);
    return;
  }

  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const cleanedConstraints = constraints.filter((c) => c.trim() !== "");
    const cleanedExamples = examples.map((example) => ({
      input: example.input.trim(),
      output: example.output.trim(),
      ...(example.explanation?.trim()
        ? { explanation: example.explanation.trim() }
        : {}),
    }));
    const cleanedTestCases = testCases.map((testCase) => ({
      input: testCase.input.trim(),
      output: testCase.output.trim(),
      isHidden: testCase.isHidden,
    }));

    const cleanedSuggestedIncludes: { [key: string]: string[] } = {};
    Object.entries(suggestedIncludes).forEach(([lang, includes]) => {
      const filtered = includes.filter(inc => inc.trim() !== "");
      if (filtered.length > 0) {
        cleanedSuggestedIncludes[lang] = filtered;
      }
    });

    const functionName = "solution";
    
    const codeTemplates = {
      cpp: `// Write your C++ solution here\nint solution() {\n    // Your code here\n    return 0;\n}`,
      java: `// Write your Java solution here\npublic class Solution {\n    public int solution() {\n        // Your code here\n        return 0;\n    }\n}`,
      python: `# Write your Python solution here\ndef solution():\n    # Your code here\n    return 0`,
      javascript: `// Write your JavaScript solution here\nfunction solution() {\n    // Your code here\n    return 0;\n}`
    };

    const requestData = {
      ...formData,
      examples: cleanedExamples,
      constraints: cleanedConstraints,
      testCases: cleanedTestCases,
      solutionCode: solutionCode,
      suggestedIncludes: cleanedSuggestedIncludes,
      functionName: functionName,
      codeTemplates: codeTemplates,
      inputFormat: formData.inputFormat || "Single line input",
      outputFormat: formData.outputFormat || "Single line output",
    };

    console.log("=== REQUEST DATA ===");
    console.log("Title:", requestData.title);
    console.log("Difficulty:", requestData.difficulty);
    console.log("Description:", requestData.description);
    console.log("Categories:", requestData.categories);
    console.log("Examples count:", requestData.examples.length);
    console.log("Constraints count:", requestData.constraints.length);
    console.log("Test cases count:", requestData.testCases.length);
    console.log("Solution language:", requestData.solutionCode.language);
    console.log("Solution code length:", requestData.solutionCode.code.length);
    console.log("Function name:", requestData.functionName);
    console.log("Has code templates:", !!requestData.codeTemplates);
    console.log("Full request data:", JSON.stringify(requestData, null, 2));

    console.log("Sending request to API...");
    const response = await problemRequestAPI.submitRequest(requestData);
    
    console.log("=== API RESPONSE ===");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    
    setSuccess(
      "Problem submitted successfully! Your submission will be reviewed by an admin."
    );
    
    if (onSuccess && response.data.requestId) {
      onSuccess(response.data.requestId);
    }

    setTimeout(() => {
      setStep(1);
      setFormData({
        title: "",
        difficulty: "Medium",
        description: "",
        inputFormat: "",
        outputFormat: "",
        categories: [],
      });
      setExamples([{ input: "", output: "", explanation: "" }]);
      setConstraints([""]);
      setTestCases([{ input: "", output: "", isHidden: false }]);
      setSolutionCode({
        language: "cpp",
        code: `// Write your complete solution here\n\nint main() {\n    \n    return 0;\n}`,
      });
    }, 3000);
    
  } catch (err: any) {
    console.error("=== SUBMISSION ERROR ===");
    console.error("Error object:", err);
    console.error("Error response:", err.response);
    console.error("Error message:", err.message);
    
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
      setError(
        err.response.data?.error || 
        err.response.data?.message || 
        `Server error: ${err.response.status}`
      );
    } else if (err.request) {
      console.error("No response received:", err.request);
      setError("No response from server. Please check your connection.");
    } else {
      console.error("Request setup error:", err.message);
      setError(`Request failed: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      title: "",
      difficulty: "Medium",
      description: "",
      inputFormat: "",
      outputFormat: "",
      categories: [],
    });
    setExamples([{ input: "", output: "", explanation: "" }]);
    setConstraints([""]);
    setTestCases([{ input: "", output: "", isHidden: false }]);
    setSolutionCode({
      language: "cpp",
      code: `// Write your complete solution here\n\nint main() {\n    \n    return 0;\n}`,
    });
    setSuggestedIncludes({
      cpp: [],
      java: [],
      python: [],
      javascript: [],
    });
    setIncludeInputs({
      cpp: "",
      java: "",
      python: "",
      javascript: "",
    });
    setCurrentIncludeLanguage("cpp");
    setStep(1);
    setCategoryInput("");
  };

  return (
    <div className="problem-upload-form">
      <div className="card bg-dark text-light border-secondary">
        <div className="card-header bg-secondary d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Submit a New Problem</h3>
          <div className="step-indicator">Step {step} of 4</div>
        </div>

        <div className="card-body">
          {success && (
            <div className="alert alert-success mb-4" role="alert">
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="step-content">
                <h4 className="mb-4">Basic Information</h4>

                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Two Sum"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="difficulty" className="form-label">
                    Difficulty *
                  </label>
                  <select
                    className="form-select bg-dark text-light border-secondary"
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => handleDifficultyChange(e)}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Categories *</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="e.g., Arrays"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddCategory}
                    >
                      Add
                    </button>
                  </div>

                  {formData.categories.length > 0 && (
                    <div className="mt-2">
                      {formData.categories.map((category, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary me-2 mb-1 p-2"
                        >
                          {category}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            aria-label="Remove"
                            onClick={() => handleRemoveCategory(category)}
                            style={{ fontSize: "0.5rem" }}
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <textarea
                    className="form-control bg-dark text-light border-secondary"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Provide a detailed problem description..."
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="inputFormat" className="form-label">
                    Input Format *
                  </label>
                  <textarea
                    className="form-control bg-dark text-light border-secondary"
                    id="inputFormat"
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe how the input is formatted..."
                    required
                  ></textarea>
                  <small className="text-muted">
                    Explain exactly how users should read the input from stdin.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="outputFormat" className="form-label">
                    Output Format *
                  </label>
                  <textarea
                    className="form-control bg-dark text-light border-secondary"
                    id="outputFormat"
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe how the output should be formatted..."
                    required
                  ></textarea>
                  <small className="text-muted">
                    Explain exactly how users should format their output to stdout.
                  </small>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h4 className="mb-4">Examples and Constraints</h4>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label mb-0">Examples *</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addExample}
                    >
                      Add Example
                    </button>
                  </div>

                  {examples.map((example, index) => (
                    <div
                      key={index}
                      className="card bg-dark border-secondary mb-3"
                    >
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Example {index + 1}</h6>
                        {examples.length > 1 && (
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Remove"
                            onClick={() => removeExample(index)}
                          ></button>
                        )}
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label">Input *</label>
                          <textarea
                            className="form-control bg-dark text-light border-secondary"
                            value={example.input}
                            onChange={(e) =>
                              handleExampleChange(
                                index,
                                "input",
                                e.target.value
                              )
                            }
                            rows={2}
                            placeholder="Input exactly as it appears in stdin"
                            required
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Output *</label>
                          <textarea
                            className="form-control bg-dark text-light border-secondary"
                            value={example.output}
                            onChange={(e) =>
                              handleExampleChange(
                                index,
                                "output",
                                e.target.value
                              )
                            }
                            rows={2}
                            placeholder="Expected output exactly as it appears in stdout"
                            required
                          ></textarea>
                        </div>
                        <div>
                          <label className="form-label">
                            Explanation (Optional)
                          </label>
                          <textarea
                            className="form-control bg-dark text-light border-secondary"
                            value={example.explanation || ""}
                            onChange={(e) =>
                              handleExampleChange(
                                index,
                                "explanation",
                                e.target.value
                              )
                            }
                            rows={2}
                            placeholder="Explain why this output is correct..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label mb-0">Constraints *</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addConstraint}
                    >
                      Add Constraint
                    </button>
                  </div>

                  {constraints.map((constraint, index) => (
                    <div key={index} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        value={constraint}
                        onChange={(e) =>
                          handleConstraintChange(index, e.target.value)
                        }
                        placeholder="e.g., 2 <= nums.length <= 10^4"
                        required
                      />
                      {constraints.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeConstraint(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h4 className="mb-4">Test Cases</h4>
                <p className="text-muted mb-4">
                  Create test cases to validate user solutions. Hidden test
                  cases are not visible to users. Input and output should match
                  exactly what stdin/stdout would contain.
                </p>

                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addTestCase}
                  >
                    Add Test Case
                  </button>
                </div>

                {testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="card bg-dark border-secondary mb-3"
                  >
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Test Case {index + 1}</h6>
                        <div className="form-check form-switch mt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`hidden-${index}`}
                            checked={testCase.isHidden}
                            onChange={() =>
                              handleTestCaseChange(index, "isHidden", null)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`hidden-${index}`}
                          >
                            Hidden Test Case
                          </label>
                        </div>
                      </div>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          aria-label="Remove"
                          onClick={() => removeTestCase(index)}
                        ></button>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Input *</label>
                        <textarea
                          className="form-control bg-dark text-light border-secondary"
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          rows={2}
                          placeholder="Input exactly as it would appear in stdin..."
                          required
                        ></textarea>
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Expected Output *</label>
                        <textarea
                          className="form-control bg-dark text-light border-secondary"
                          value={testCase.output}
                          onChange={(e) =>
                            handleTestCaseChange(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          rows={2}
                          placeholder="Expected output exactly as it would appear in stdout..."
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-content">
                <h4 className="mb-4">Solution and Suggested Includes</h4>

                <div className="mb-4">
                  <h5 className="mb-3">Your Solution *</h5>
                  <p className="text-muted mb-3">
                    Provide a complete working solution that reads from stdin and writes to stdout.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      value={solutionCode.language}
                      onChange={handleSolutionLanguageChange}
                    >
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div
                    className="code-editor-container"
                    style={{ height: "300px" }}
                  >
                    <CodeEditor
                      code={solutionCode.code}
                      language={solutionCode.language}
                      onChange={handleSolutionCodeChange}
                    />
                  </div>
                  <small className="text-muted">
                    Provide your complete working solution that reads from stdin and writes to stdout.
                    This will be used to verify test cases.
                  </small>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Suggested Includes/Imports (Optional)</h5>
                  <p className="text-muted mb-3">
                    Add helpful include/import suggestions that will appear as comments in the code editor.
                    These help guide users on what libraries they might need.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      value={currentIncludeLanguage}
                      onChange={(e) => setCurrentIncludeLanguage(e.target.value as keyof typeof suggestedIncludes)}
                    >
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>

                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      placeholder={
                        currentIncludeLanguage === "cpp" ? "#include <vector>" :
                        currentIncludeLanguage === "java" ? "import java.util.*;" :
                        currentIncludeLanguage === "python" ? "import sys" :
                        "const fs = require('fs');"
                      }
                      value={includeInputs[currentIncludeLanguage]}
                      onChange={(e) => handleIncludeInputChange(currentIncludeLanguage, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => addSuggestedInclude(currentIncludeLanguage)}
                    >
                      Add
                    </button>
                  </div>

                  {/* Display current includes for selected language */}
                  {suggestedIncludes[currentIncludeLanguage].length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-info">{currentIncludeLanguage.toUpperCase()} Suggestions:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {suggestedIncludes[currentIncludeLanguage].map((include, index) => (
                          <span
                            key={index}
                            className="badge bg-secondary p-2"
                          >
                            <code>{include}</code>
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              style={{ fontSize: "0.5rem" }}
                              onClick={() => removeSuggestedInclude(currentIncludeLanguage, index)}
                            ></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show all language suggestions */}
                  <div className="mt-4">
                    <h6 className="text-muted">All Suggested Includes:</h6>
                    {Object.entries(suggestedIncludes).map(([lang, includes]) => (
                      includes.length > 0 && (
                        <div key={lang} className="mb-2">
                          <strong className="text-info">{lang.toUpperCase()}:</strong>
                          <div className="ms-3">
                            {includes.map((include, index) => (
                              <div key={index} className="text-muted">
                                <code>// {include}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Problem"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProblemUploadForm;
