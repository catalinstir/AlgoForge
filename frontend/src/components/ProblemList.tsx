import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProblemPreview from "./ProblemPreview";
import { Problem } from "../App";
import { problemAPI } from "../services/api";

const ProblemList = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProblemId, setHoveredProblemId] = useState<number | null>(null);
  const [filter, setFilter] = useState({
    difficulty: "",
    search: "",
    category: "",
  });

  useEffect(() => {
    fetchProblems();
  }, [filter]);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filter.difficulty) params.difficulty = filter.difficulty;
      if (filter.search) params.search = filter.search;
      if (filter.category) params.category = filter.category;

      const response = await problemAPI.getAllProblems(params);
      setProblems(response.data);
    } catch (err) {
      console.error("Error fetching problems:", err);
      setError("Failed to load problems. Please try again later.");
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

  if (error) {
    return (
      <div className="alert alert-danger p-3" role="alert">
        <h4 className="alert-heading">Error</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={fetchProblems}>
          Try Again
        </button>
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
              problems.map((problem) => (
                <tr
                  key={problem.id}
                  className="problem-row"
                  onMouseEnter={() => setHoveredProblemId(problem.id)}
                  onMouseLeave={() => setHoveredProblemId(null)}
                  style={{ position: "relative" }}
                >
                  <td>{problem.id}</td>
                  <td>
                    <Link
                      to={`/problem/${problem.id}`}
                      className="problem-title-link"
                    >
                      {problem.title}
                    </Link>
                    {hoveredProblemId === problem.id && (
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
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No problems found. Try adjusting your filters.
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
