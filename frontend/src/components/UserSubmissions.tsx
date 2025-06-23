import React, { useState, useEffect } from "react";
import { submissionAPI } from "../services/api";
import { User } from "../types";

interface Submission {
  _id: string;
  problem: {
    _id: string;
    title: string;
    difficulty: string;
  };
  status: string;
  language: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: string;
  passRate?: number;
}

interface UserSubmissionsProps {
  user: User | null;
}

const UserSubmissions = ({ user }: UserSubmissionsProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, pagination.page]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await submissionAPI.getUserSubmissions(params);
      setSubmissions(response.data.submissions);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError(
        err.response?.data?.error || "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  const getDifficultyColorClass = (difficulty: string): string => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <div className="text-center text-light p-4">
        Please log in to view your submissions.
      </div>
    );
  }

  return (
    <div className="user-submissions">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-light mb-0">My Submissions</h4>
        <small className="text-muted">
          Total: {pagination.total} submissions
        </small>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
          <button
            className="btn btn-outline-danger ms-3 btn-sm"
            onClick={fetchSubmissions}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Submitted</th>
                  <th>Go to Problem</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{submission.problem.title}</div>
                          <small className={getDifficultyColorClass(submission.problem.difficulty)}>
                            {submission.problem.difficulty}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {submission.language.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">
                          {submission.testCasesPassed}/{submission.totalTestCases}
                        </span>
                      </td>
                      <td>{submission.executionTime}ms</td>
                      <td>
                        <small className="text-muted">
                          {formatDate(submission.createdAt)}
                        </small>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.open(`/problem/${submission.problem._id}`, '_self')}
                          title="Go to problem"
                        >
                          <i className="bi bi-arrow-right me-1"></i>
                          Problem page
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      {loading
                        ? "Loading submissions..."
                        : "No submissions yet. Start solving problems!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav aria-label="Submissions pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link bg-dark text-light border-secondary"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.page - 2);
                  const pageNum = startPage + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <li
                      key={pageNum}
                      className={`page-item ${pagination.page === pageNum ? "active" : ""}`}
                    >
                      <button
                        className="page-link bg-dark text-light border-secondary"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                  <button
                    className="page-link bg-dark text-light border-secondary"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default UserSubmissions;
