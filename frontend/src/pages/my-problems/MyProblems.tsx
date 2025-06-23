import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { problemRequestAPI } from "../../services/api";
import { User } from "../../types";

interface MyProblemsProps {
  currentUser: User | null;
}

interface ProblemRequest {
  _id: string;
  title: string;
  difficulty: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  reviewedAt?: string;
  feedback?: string;
  approvedProblem?: {
    _id: string;
    title: string;
  };
}

const MyProblems = ({ currentUser }: MyProblemsProps) => {
  const [requests, setRequests] = useState<ProblemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests();
    }
  }, [currentUser]);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="my-problems-container text-center text-light p-5">
        <div className="card bg-dark text-light border-secondary">
          <div className="card-body">
            <i className="bi bi-exclamation-circle text-warning fs-1 mb-3"></i>
            <h3>Login Required</h3>
            <p className="text-muted">Please log in to view your problem submissions.</p>
            <a href="/login" className="btn btn-primary">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const fetchMyRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await problemRequestAPI.getUserRequests();
      setRequests(response.data);
    } catch (err: any) {
      console.error("Error fetching problem requests:", err);
      setError(err.response?.data?.error || "Failed to load your problem submissions.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Approved":
        return "bg-success";
      case "Rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-success";
      case "Medium":
        return "text-warning";
      case "Hard":
        return "text-danger";
      default:
        return "text-muted";
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === "all") return true;
    return request.status.toLowerCase() === filter;
  });

  const getStats = () => {
    const pending = requests.filter(r => r.status === "Pending").length;
    const approved = requests.filter(r => r.status === "Approved").length;
    const rejected = requests.filter(r => r.status === "Rejected").length;
    return { pending, approved, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="my-problems-container text-center text-light p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your submissions...</span>
        </div>
        <p className="mt-3">Loading your problem submissions...</p>
      </div>
    );
  }

  return (
    <div className="my-problems-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-light mb-1">
            <i className="bi bi-list-ul me-2"></i>
            My Problem Submissions
          </h2>
          <p className="text-muted mb-0">
            Track the status of your submitted problems and manage your contributions.
          </p>
        </div>
        <Link to="/publish" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>
          Submit New Problem
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body text-center">
              <div className="fs-3 text-info">{requests.length}</div>
              <div className="text-muted">Total Submissions</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-warning">
            <div className="card-body text-center">
              <div className="fs-3 text-warning">{stats.pending}</div>
              <div className="text-muted">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-success">
            <div className="card-body text-center">
              <div className="fs-3 text-success">{stats.approved}</div>
              <div className="text-muted">Approved</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-danger">
            <div className="card-body text-center">
              <div className="fs-3 text-danger">{stats.rejected}</div>
              <div className="text-muted">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({requests.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({stats.pending})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "approved" ? "active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Approved ({stats.approved})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected ({stats.rejected})
            </button>
          </li>
        </ul>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchMyRequests}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            className="btn btn-outline-danger ms-3 btn-sm"
            onClick={fetchMyRequests}
          >
            Retry
          </button>
        </div>
      )}

      {/* Problems List */}
      <div className="card bg-dark text-light border-secondary">
        <div className="card-body">
          {filteredRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Reviewed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{request.title}</div>
                          <small className="text-muted">
                            {request.description.length > 60
                              ? `${request.description.substring(0, 60)}...`
                              : request.description}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={getDifficultyColor(request.difficulty)}>
                          {request.difficulty}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        {request.reviewedAt ? (
                          <small className="text-muted">
                            {new Date(request.reviewedAt).toLocaleDateString()}
                          </small>
                        ) : (
                          <small className="text-muted">-</small>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-outline-info btn-sm"
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {request.status === "Pending" && (
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              title="Edit submission"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {request.status === "Approved" && request.approvedProblem && (
                            <Link
                              to={`/problem/${request.approvedProblem._id}`}
                              className="btn btn-outline-success btn-sm"
                              title="View published problem"
                            >
                              <i className="bi bi-arrow-right"></i>
                            </Link>
                          )}
                          {request.feedback && (
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              title="View feedback"
                            >
                              <i className="bi bi-chat-square-text"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
              <h4 className="text-muted">
                {filter === "all" 
                  ? "No problem submissions yet" 
                  : `No ${filter} submissions`}
              </h4>
              <p className="text-muted mb-4">
                {filter === "all" 
                  ? "Start contributing to the AlgoRush community by submitting your first problem!"
                  : `You don't have any ${filter} submissions at the moment.`}
              </p>
              {filter === "all" && (
                <Link to="/publish" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i>
                  Submit Your First Problem
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProblems;
