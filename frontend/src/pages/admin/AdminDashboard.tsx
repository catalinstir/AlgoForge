import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { problemAPI } from "../../services/api";

interface AdminDashboardProps {
  currentUser: User | null;
}

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("problems");
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock Users and Submissions data
  const mockUsers = [
    {
      id: 101,
      username: "admin",
      role: "admin",
      solved: 10,
      total: 10,
      status: "Active",
    },
    {
      id: 102,
      username: "user123",
      role: "user",
      solved: 5,
      total: 10,
      status: "Active",
    },
    {
      id: 103,
      username: "newbie_dev",
      role: "user",
      solved: 1,
      total: 10,
      status: "Banned",
    },
  ];

  const mockSubmissions = [
    {
      id: 1001,
      user: "user123",
      problem: "Two Sum",
      status: "Accepted",
      date: "2025-04-17",
      lang: "C++",
    },
    {
      id: 1002,
      user: "newbie_dev",
      problem: "Add Two Numbers",
      status: "Wrong Answer",
      date: "2025-04-16",
      lang: "Python",
    },
    {
      id: 1003,
      user: "admin",
      problem: "Two Sum",
      status: "Accepted",
      date: "2025-04-15",
      lang: "Java",
    },
  ];

  useEffect(() => {
    if (selectedTab === "problems") {
      fetchProblems();
    }
  }, [selectedTab]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await problemAPI.getAllProblems();
      setProblems(response.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  // Permission Check: Ensure user is logged in and is an admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="container main-content p-4">
        <div className="alert alert-danger text-center">
          Access Denied. You do not have permission to view this page.
        </div>
      </div>
    );
  }

  // Helper to get badge class based on status
  const getStatusBadge = (status: string): string => {
    switch (status.toLowerCase()) {
      case "published":
      case "active":
      case "accepted":
        return "bg-success";
      case "draft":
      case "pending":
        return "bg-warning text-dark";
      case "banned":
      case "rejected":
      case "failed":
      case "wrong answer":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Helper for difficulty color
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

  const formatSubmissions = (totalSubmissions: number): string => {
    if (totalSubmissions === 0) return "0";
    if (totalSubmissions < 1000) return totalSubmissions.toString();
    if (totalSubmissions < 1000000) return `${(totalSubmissions / 1000).toFixed(1)}K`;
    return `${(totalSubmissions / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="admin-dashboard">
      <div className="problems-container">
        {/* Dashboard Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
          <h2 className="text-light mb-0">Admin Dashboard</h2>
          <div>
            <span className="text-muted me-2">
              Welcome, {currentUser.username}!
            </span>
            <span className="badge bg-danger fs-6 align-middle">
              Admin Access
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs nav-fill mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${
                selectedTab === "problems" ? "active" : "text-muted"
              }`}
              onClick={() => setSelectedTab("problems")}
              type="button"
            >
              Manage Problems
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                selectedTab === "users" ? "active" : "text-muted"
              }`}
              onClick={() => setSelectedTab("users")}
              type="button"
            >
              Manage Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                selectedTab === "submissions" ? "active" : "text-muted"
              }`}
              onClick={() => setSelectedTab("submissions")}
              type="button"
            >
              View Submissions
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Problems Tab */}
          {selectedTab === "problems" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">Problems</h4>
                <button className="btn btn-success btn-add-new">
                  + Add New Problem
                </button>
              </div>
              
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover table-sm align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Difficulty</th>
                        <th>Acceptance</th>
                        <th>Submissions</th>
                        <th>Solvers</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.length > 0 ? (
                        problems.map((problem, index) => (
                          <tr key={problem._id || problem.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="d-flex flex-column">
                                <span>{problem.title}</span>
                                {problem.categories && problem.categories.length > 0 && (
                                  <div className="mt-1">
                                    {problem.categories.slice(0, 2).map((cat: string, idx: number) => (
                                      <span key={idx} className="badge bg-info me-1" style={{ fontSize: "0.6rem" }}>
                                        {cat}
                                      </span>
                                    ))}
                                    {problem.categories.length > 2 && (
                                      <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                                        +{problem.categories.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={getDifficultyColorClass(problem.difficulty)}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="fw-bold">
                                  {problem.acceptance || "0%"}
                                </span>
                                {problem.totalSubmissions > 0 && (
                                  <small className="text-muted">
                                    {problem.successfulSubmissions || 0} / {problem.totalSubmissions || 0}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="fw-bold">
                                  {formatSubmissions(problem.totalSubmissions || 0)}
                                </span>
                                <small className="text-muted">
                                  {problem.uniqueAttempts || 0} unique
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="text-success fw-bold">
                                {problem.uniqueSolvers || 0}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadge(problem.status || "Draft")}`}>
                                {problem.status || "Draft"}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button className="btn btn-warning me-1">Edit</button>
                                <button className="btn btn-info me-1">Stats</button>
                                <button className="btn btn-danger">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-3">
                            No problems found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === "users" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">Users</h4>
                <div className="input-group" style={{ maxWidth: "300px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users..."
                    aria-label="Search users"
                  />
                  <button className="btn btn-info">Search</button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover table-sm align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Solved</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === "admin" ? "bg-danger" : "bg-info"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.solved}/{u.total}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-warning me-1">Edit</button>
                          <button
                            className={`btn ${
                              u.status === "Banned"
                                ? "btn-success"
                                : "btn-danger"
                            }`}
                          >
                            {u.status === "Banned" ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {selectedTab === "submissions" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">Recent Submissions</h4>
                <div>
                  <button className="btn btn-secondary me-2">Filter</button>
                  <button className="btn btn-info">Export</button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover table-sm align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Problem</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubmissions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.user}</td>
                        <td>{s.problem}</td>
                        <td>{s.lang}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.date}</td>
                        <td>
                          <button className="btn btn-info">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
