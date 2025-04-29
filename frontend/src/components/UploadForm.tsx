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
    functionName: "",
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
    language: "javascript",
    code: "// Your solution code here",
  });
  const [codeTemplates, setCodeTemplates] = useState({
    javascript: "// JavaScript template\n",
    python: "# Python template\n",
    cpp: "// C++ template\n",
    java: "// Java template\n",
  });

  const [currentTemplateLanguage, setCurrentTemplateLanguage] =
    useState("javascript");
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

  const handleTemplateLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCurrentTemplateLanguage(e.target.value);
  };

  const handleTemplateCodeChange = (newCode: string) => {
    setCodeTemplates((prev) => ({
      ...prev,
      [currentTemplateLanguage]: newCode,
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
        if (!formData.functionName.trim()) {
          setError("Function name is required");
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

        const languages = Object.keys(codeTemplates);
        for (const lang of languages) {
          if (!codeTemplates[lang as keyof typeof codeTemplates].trim()) {
            setError(`Template for ${lang} is required`);
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
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

      const cleanedTemplates: { [key: string]: string } = {};
      Object.entries(codeTemplates).forEach(([lang, code]) => {
        if (code.trim() !== "") {
          cleanedTemplates[lang] = code;
        }
      });

      const requestData = {
        ...formData,
        examples: cleanedExamples,
        constraints: cleanedConstraints,
        testCases: cleanedTestCases,
        solutionCode: solutionCode,
        codeTemplates: cleanedTemplates,
      };

      const response = await problemRequestAPI.submitRequest(requestData);
      setSuccess(
        "Problem submitted successfully! Your submission will be reviewed by an admin."
      );

      if (onSuccess) {
        onSuccess(response.data.requestId);
      }

      resetForm();
    } catch (err: any) {
      console.error("Error submitting problem:", err);
      setError(
        err.response?.data?.error ||
          "Failed to submit problem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      difficulty: "Medium",
      description: "",
      functionName: "",
      categories: [],
    });
    setExamples([{ input: "", output: "", explanation: "" }]);
    setConstraints([""]);
    setTestCases([{ input: "", output: "", isHidden: false }]);
    setSolutionCode({
      language: "javascript",
      code: "// Your solution code here",
    });
    setCodeTemplates({
      javascript: "// JavaScript template\n",
      python: "# Python template\n",
      cpp: "// C++ template\n",
      java: "// Java template\n",
    });
    setCurrentTemplateLanguage("javascript");
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
                  <label htmlFor="functionName" className="form-label">
                    Function Name *
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    id="functionName"
                    name="functionName"
                    value={formData.functionName}
                    onChange={handleChange}
                    placeholder="e.g., twoSum"
                    required
                  />
                  <small className="text-muted">
                    This will be the name of the function users implement in
                    their solution.
                  </small>
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
                            placeholder="e.g., nums = [2, 7, 11, 15], target = 9"
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
                            placeholder="e.g., [0, 1]"
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
                  cases are not visible to users.
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
                          placeholder="Test input..."
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
                          placeholder="Expected output..."
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
                <h4 className="mb-4">Solution and Code Templates</h4>

                <div className="mb-4">
                  <h5 className="mb-3">Your Solution *</h5>
                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      value={solutionCode.language}
                      onChange={handleSolutionLanguageChange}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div
                    className="code-editor-container"
                    style={{ height: "200px" }}
                  >
                    <CodeEditor
                      code={solutionCode.code}
                      language={solutionCode.language}
                      onChange={handleSolutionCodeChange}
                    />
                  </div>
                  <small className="text-muted">
                    Provide your working solution to the problem. This will be
                    used to verify test cases.
                  </small>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Code Templates *</h5>
                  <p className="text-muted">
                    Create starter templates for each supported language.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      value={currentTemplateLanguage}
                      onChange={handleTemplateLanguageChange}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>

                  <div
                    className="code-editor-container"
                    style={{ height: "200px" }}
                  >
                    <CodeEditor
                      code={
                        codeTemplates[
                          currentTemplateLanguage as keyof typeof codeTemplates
                        ]
                      }
                      language={currentTemplateLanguage}
                      onChange={handleTemplateCodeChange}
                    />
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
