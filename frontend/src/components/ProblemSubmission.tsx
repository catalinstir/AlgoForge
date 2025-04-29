import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { submissionAPI, problemAPI } from "../services/api";

interface Submission {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  status: string;
  language: string;
  executionTime: number;
  memoryUsed: number;
  createdAt: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  acceptance: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const AdminProblemSubmissions = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  useEffect(() => {
    if (problemId) {
      fetchProblem();
      fetchSubmissions(1);
    }
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const response = await problemAPI.getProblemById(problemId as string);
      setProblem(response.data);
    } catch (err: any) {
      console.error("Error fetching problem:", err);
      setError(
        `Failed to load problem: ${err.response?.data?.error || err.message}`
      );
    }
  };

  const fetchSubmissions = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submissionAPI.getProblemSubmissions(
        problemId as string,
        { page, limit: pagination.limit }
      );
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError(
        `Failed to load submissions: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchSubmissions(newPage);
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-success";
      case "wrong answer":
        return "bg-danger";
      case "time limit exceeded":
        return "bg-warning text-dark";
      case "memory limit exceeded":
        return "bg-warning text-dark";
      case "runtime error":
        return "bg-danger";
      case "compilation error":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading submissions...</span>
        </div>
        <span className="ms-3 text-light">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error</h4>
        <p>{error}</p>
        <hr />
        <button
          className="btn btn-outline-danger"
          onClick={() => fetchSubmissions(1)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-submissions-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          Submissions for: {problem?.title || "Loading..."}
        </h2>
        <Link to="/admin/problems" className="btn btn-outline-secondary">
          Back to Problems
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-cards row mb-4">
        <div className="col-md-3">
          <div className="card bg-dark text-light">
            <div className="card-body">
              <h5 className="card-title">Total Submissions</h5>
              <p className="card-text fs-4">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light">
            <div className="card-body">
              <h5 className="card-title">Acceptance Rate</h5>
              <p className="card-text fs-4">{problem?.acceptance || "N/A"}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light">
            <div className="card-body">
              <h5 className="card-title">Avg. Execution Time</h5>
              <p className="card-text fs-4">
                {submissions.length
                  ? `${(
                      submissions.reduce(
                        (acc, sub) => acc + sub.executionTime,
                        0
                      ) / submissions.length
                    ).toFixed(2)} ms`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light">
            <div className="card-body">
              <h5 className="card-title">Difficulty</h5>
              <p className="card-text fs-4">
                <span
                  className={`badge ${
                    problem?.difficulty === "Easy"
                      ? "bg-success"
                      : problem?.difficulty === "Medium"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                >
                  {problem?.difficulty || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Status</th>
              <th>User</th>
              <th>Language</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <tr key={submission._id}>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        submission.status
                      )}`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/admin/users/${submission.user?._id}`}
                      className="text-info"
                    >
                      {submission.user?.username || "Unknown"}
                    </Link>
                  </td>
                  <td>{submission.language.toUpperCase()}</td>
                  <td>{`${submission.executionTime} ms`}</td>
                  <td>{`${submission.memoryUsed} KB`}</td>
                  <td>{new Date(submission.createdAt).toLocaleString()}</td>
                  <td>
                    <Link
                      to={`/admin/submissions/${submission._id}`}
                      className="btn btn-sm btn-outline-info"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  No submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <nav aria-label="Submissions pagination" className="mt-4">
          <ul className="pagination justify-content-center">
            <li
              className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <li
                  key={page}
                  className={`page-item ${
                    pagination.page === page ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              )
            )}
            <li
              className={`page-item ${
                pagination.page === pagination.pages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default AdminProblemSubmissions;
