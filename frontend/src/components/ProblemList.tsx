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

  // Listen for problem solved events to refresh the list
  useEffect(() => {
    const handleProblemSolved = () => {
      console.log("Problem solved event received, refreshing problem list...");
      fetchProblems();
    };

    window.addEventListener('problemSolved', handleProblemSolved);
    return () => {
      window.removeEventListener('problemSolved', handleProblemSolved);
    };
  }, []);

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

  const handleDifficultyButtonClick = (difficulty: string) => {
    setFilter((prev) => ({ 
      ...prev, 
      difficulty: prev.difficulty === difficulty ? "" : difficulty 
    }));
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

  const formatSubmissions = (totalSubmissions: number): string => {
    if (totalSubmissions === 0) return "0";
    if (totalSubmissions < 1000) return totalSubmissions.toString();
    if (totalSubmissions < 1000000) return `${(totalSubmissions / 1000).toFixed(1)}K`;
    return `${(totalSubmissions / 1000000).toFixed(1)}M`;
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

  if (error) {
    return (
      <div className="problems-container">
        <h2 className="text-light mb-4">Problems</h2>
        <div className="alert alert-danger">
          <h5>Error Loading Problems</h5>
          <p>{error}</p>
          <button 
            className="btn btn-outline-light btn-sm mt-2" 
            onClick={fetchProblems}
          >
            Try Again
          </button>
          {debugInfo && (
            <details className="mt-3">
              <summary>Debug Information (Click to expand)</summary>
              <pre className="mt-2 text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="problems-container">
      <h2 className="text-light mb-4">Problems</h2>

      {/* Filter Section */}
      <div className="row mb-4">
        {/* Difficulty Buttons */}
        <div className="col-md-6 mb-3">
          <label className="form-label text-light mb-2">Difficulty</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn ${filter.difficulty === "Easy" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleDifficultyButtonClick("Easy")}
            >
              Easy
            </button>
            <button
              type="button"
              className={`btn ${filter.difficulty === "Medium" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => handleDifficultyButtonClick("Medium")}
            >
              Medium
            </button>
            <button
              type="button"
              className={`btn ${filter.difficulty === "Hard" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => handleDifficultyButtonClick("Hard")}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="col-md-6 mb-3">
          <label className="form-label text-light mb-2">Category</label>
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
            <option value="Hash Table">Hash Table</option>
            <option value="Math">Math</option>
            <option value="Two Pointers">Two Pointers</option>
            <option value="Binary Search">Binary Search</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="col-12 mb-3">
          <label className="form-label text-light mb-2">Search</label>
          <form onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Search problems by title or description..."
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
                aria-label="Search problems"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filter.difficulty || filter.category || filter.search) && (
        <div className="mb-3">
          <small className="text-muted">Active filters: </small>
          {filter.difficulty && (
            <span className="badge bg-secondary me-2">
              Difficulty: {filter.difficulty}
              <button 
                className="btn-close btn-close-white ms-1" 
                style={{ fontSize: "0.6rem" }}
                onClick={() => setFilter(prev => ({ ...prev, difficulty: "" }))}
              ></button>
            </span>
          )}
          {filter.category && (
            <span className="badge bg-secondary me-2">
              Category: {filter.category}
              <button 
                className="btn-close btn-close-white ms-1" 
                style={{ fontSize: "0.6rem" }}
                onClick={() => setFilter(prev => ({ ...prev, category: "" }))}
              ></button>
            </span>
          )}
          {filter.search && (
            <span className="badge bg-secondary me-2">
              Search: "{filter.search}"
              <button 
                className="btn-close btn-close-white ms-1" 
                style={{ fontSize: "0.6rem" }}
                onClick={() => setFilter(prev => ({ ...prev, search: "" }))}
              ></button>
            </span>
          )}
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setFilter({ difficulty: "", category: "", search: "" })}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Problems Table */}
      <div className="table-responsive" style={{ position: "relative", zIndex: 1 }}>
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col" style={{ width: "5%" }}>#</th>
              <th scope="col" style={{ width: "50%" }}>Title</th>
              <th scope="col" style={{ width: "15%" }}>Difficulty</th>
              <th scope="col" style={{ width: "15%" }}>Acceptance</th>
              <th scope="col" style={{ width: "15%" }}>Submissions</th>
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
                    <td style={{ position: "relative" }}>
                      <Link
                        to={`/problem/${problemId}?index=${displayIndex}`}
                        className="problem-title-link"
                      >
                        {problem.title}
                      </Link>
                      {hoveredProblemId === problemId && (
                        <div 
                          className="problem-hover-preview"
                          style={{
                            position: "absolute",
                            top: "-20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 9999,
                            pointerEvents: "none",
                            width: "350px"
                          }}
                        >
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
                    <td>{problem.acceptance || "0%"}</td>
                    <td>
                      <span className="text-muted">
                        {formatSubmissions(problem.totalSubmissions || 0)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  {loading
                    ? "Loading problems..."
                    : "No problems found. Try adjusting your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Debug Information */}
      {debugInfo && (
        <div className="mt-4">
          <div className="alert alert-info">
            <h6>Debug Information:</h6>
            <pre style={{ fontSize: "0.8rem", maxHeight: "200px", overflow: "auto" }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemList;
