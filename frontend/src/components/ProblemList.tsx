import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProblemPreview from "./ProblemPreview";
import { Problem } from "../types";
import { problemAPI } from "../services/api";
import axios from "axios";

const ProblemList = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProblemId, setHoveredProblemId] = useState<
    string | number | null
  >(null);
  const [filter, setFilter] = useState({
    difficulty: "",
    search: "",
    category: "",
  });
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetchProblems();
  }, [filter]);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log("Fetching problems with filters:", filter);

      const params: any = {};
      if (filter.difficulty) params.difficulty = filter.difficulty;
      if (filter.search) params.search = filter.search;
      if (filter.category) params.category = filter.category;

      const response = await problemAPI.getAllProblems(params);
      console.log("Problems API response:", response);

      // Check if the response data is an array
      if (Array.isArray(response.data)) {
        // Ensure each problem has an id field (use _id if id is not available)
        // Also add a displayIndex for showing sequential numbering
        const processedProblems = response.data.map((problem, index) => ({
          ...problem,
          id: problem.id || problem._id,
          displayIndex: index + 1, // Add 1-based index
        }));
        setProblems(processedProblems);
      } else {
        console.error("Unexpected response format:", response.data);
        setDebugInfo({
          message: "Unexpected response format",
          data: response.data,
        });
        setError(
          "The server returned data in an unexpected format. See console for details."
        );
      }
    } catch (err) {
      console.error("Error fetching problems:", err);

      let errorMessage = "Failed to load problems. Please try again later.";
      let errorDetails = {};

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message || errorMessage;
        errorDetails = {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
        };
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setDebugInfo(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchProblems();
  };

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

  if (loading && problems.length === 0) {
    return (
      <div className="text-center text-light p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading problems...</span>
        </div>
        <p className="mt-3">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="problems-container">
      <h2 className="text-light mb-4">Problems</h2>

      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select bg-dark text-light border-secondary"
            name="difficulty"
            value={filter.difficulty}
            onChange={handleFilterChange}
            aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select bg-dark text-light border-secondary"
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Linked Lists">Linked Lists</option>
            <option value="Trees">Trees</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>
        </div>
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Search problems..."
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
                aria-label="Search problems"
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search"></i> Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger p-3 mb-4" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>

          {debugInfo && (
            <div className="mt-3">
              <details>
                <summary>Debug Information</summary>
                <pre className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <hr />
          <button className="btn btn-outline-danger" onClick={fetchProblems}>
            Try Again
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? (
              problems.map((problem, index) => {
                // Ensure problem ID is available (either id or _id)
                const problemId = problem.id || problem._id;
                // Use 1-based index for display
                const displayIndex = index + 1;

                return (
                  <tr
                    key={problemId}
                    className="problem-row"
                    onMouseEnter={() => setHoveredProblemId(problemId || null)}
                    onMouseLeave={() => setHoveredProblemId(null)}
                    style={{ position: "relative" }}
                  >
                    <td>{displayIndex}</td>
                    <td>
                      <Link
                        to={`/problem/${problemId}?index=${displayIndex}`}
                        className="problem-title-link"
                      >
                        {problem.title}
                      </Link>
                      {hoveredProblemId === problemId && (
                        <div className="problem-hover-preview">
                          <ProblemPreview problem={problem} />
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={getDifficultyColorClass(problem.difficulty)}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>{problem.acceptance || "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  {loading
                    ? "Loading problems..."
                    : "No problems found. Try adjusting your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
