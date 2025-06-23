import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { problemAPI, submissionAPI } from "../../services/api";

interface AdminDashboardProps {
  currentUser: User | null;
}

interface AdminSubmission {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
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

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("problems");
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [submissionFilters, setSubmissionFilters] = useState({
    status: "",
    language: "",
    problemId: "",
    userId: "",
  });
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
  });
  const [submissionPagination, setSubmissionPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (selectedTab === "problems") {
      fetchProblems();
    } else if (selectedTab === "submissions") {
      fetchSubmissions();
    } else if (selectedTab === "users") {
      fetchUsers();
    }
  }, [selectedTab, submissionFilters, submissionPagination.page, userFilters, userPagination.page]);

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params: any = {
        page: userPagination.page,
        limit: userPagination.limit,
      };
      
      if (userFilters.search) params.search = userFilters.search;
      if (userFilters.role) params.role = userFilters.role;

      const response = await userAPI.getAllUsers(params);
      setUsers(response.data.users);
      setUserPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const params: any = {
        page: submissionPagination.page,
        limit: submissionPagination.limit,
      };
      
      if (submissionFilters.status) params.status = submissionFilters.status;
      if (submissionFilters.language) params.language = submissionFilters.language;
      if (submissionFilters.problemId) params.problemId = submissionFilters.problemId;
      if (submissionFilters.userId) params.userId = submissionFilters.userId;

      const response = await submissionAPI.getAllSubmissions(params);
      setSubmissions(response.data.submissions);
      setSubmissionPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleSubmissionFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSubmissionFilters(prev => ({ ...prev, [name]: value }));
    setSubmissionPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSubmissionPageChange = (newPage: number) => {
    setSubmissionPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearSubmissionFilters = () => {
    setSubmissionFilters({
      status: "",
      language: "",
      problemId: "",
      userId: "",
    });
    setSubmissionPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUserFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setUserFilters(prev => ({ ...prev, [name]: value }));
    setUserPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUserPageChange = (newPage: number) => {
    setUserPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearUserFilters = () => {
    setUserFilters({
      search: "",
      role: "",
    });
    setUserPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const action = currentStatus === "Banned" ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      // This would require implementing a ban/unban endpoint
      // For now, just show an alert
      alert(`User ${action} functionality would be implemented here.`);
      // await userAPI.banUser(userId, action === "ban");
      // fetchUsers();
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await userAPI.updateUserRole(userId, { role: newRole });
      fetchUsers();
      alert("User role updated successfully.");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }

    try {
      await submissionAPI.deleteSubmission(submissionId);
      // Refresh the submissions list
      fetchSubmissions();
      alert("Submission deleted successfully.");
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
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
                <h4 className="text-light mb-0">Users ({userPagination.total})</h4>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearUserFilters}
                >
                  Clear Filters
                </button>
              </div>

              {/* User Filters */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Search by username or email..."
                    name="search"
                    value={userFilters.search}
                    onChange={handleUserFilterChange}
                  />
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    name="role"
                    value={userFilters.role}
                    onChange={handleUserFilterChange}
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div>

              {usersLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover table-sm align-middle">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Progress</th>
                          <th>Success Rate</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">{user.username}</span>
                                  <small className="text-muted">{user.email}</small>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    user.role === "admin" ? "bg-danger" : 
                                    user.role === "user" ? "bg-info" : "bg-secondary"
                                  }`}
                                >
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">
                                    {user.problemsSolved?.length || 0} solved
                                  </span>
                                  <small className="text-muted">
                                    {user.problemsAttempted?.length || 0} attempted
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className="text-success fw-bold">
                                  {user.successRate?.toFixed(1) || 0}%
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-info btn-sm"
                                    title="View profile"
                                    onClick={() => window.open(`/profile/${user._id}`, '_blank')}
                                  >
                                    <i className="bi bi-person"></i>
                                  </button>
                                  <div className="dropdown">
                                    <button 
                                      className="btn btn-warning btn-sm dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                      title="Change role"
                                    >
                                      <i className="bi bi-gear"></i>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-dark">
                                      <li>
                                        <button 
                                          className="dropdown-item"
                                          onClick={() => handleUpdateUserRole(user._id, "user")}
                                          disabled={user.role === "user"}
                                        >
                                          Make User
                                        </button>
                                      </li>
                                      <li>
                                        <button 
                                          className="dropdown-item"
                                          onClick={() => handleUpdateUserRole(user._id, "admin")}
                                          disabled={user.role === "admin"}
                                        >
                                          Make Admin
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    title="Ban/Unban user"
                                    onClick={() => handleBanUser(user._id, user.status || "Active")}
                                  >
                                    <i className="bi bi-ban"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-3">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* User Pagination */}
                  {userPagination.pages > 1 && (
                    <nav aria-label="Users pagination" className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${userPagination.page === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleUserPageChange(userPagination.page - 1)}
                            disabled={userPagination.page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, userPagination.pages) }, (_, i) => {
                          const startPage = Math.max(1, userPagination.page - 2);
                          const pageNum = startPage + i;
                          if (pageNum > userPagination.pages) return null;
                          
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${userPagination.page === pageNum ? "active" : ""}`}
                            >
                              <button
                                className="page-link bg-dark text-light border-secondary"
                                onClick={() => handleUserPageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${userPagination.page === userPagination.pages ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleUserPageChange(userPagination.page + 1)}
                            disabled={userPagination.page === userPagination.pages}
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
          )}

          {/* Submissions Tab */}
          {selectedTab === "submissions" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">All Submissions</h4>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearSubmissionFilters}
                  >
                    Clear Filters
                  </button>
                  <button className="btn btn-info btn-sm">Export CSV</button>
                </div>
              </div>

              {/* Submission Filters */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    name="status"
                    value={submissionFilters.status}
                    onChange={handleSubmissionFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                    <option value="Runtime Error">Runtime Error</option>
                    <option value="Compilation Error">Compilation Error</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    name="language"
                    value={submissionFilters.language}
                    onChange={handleSubmissionFilterChange}
                  >
                    <option value="">All Languages</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Username filter..."
                    name="userId"
                    value={submissionFilters.userId}
                    onChange={handleSubmissionFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Problem filter..."
                    name="problemId"
                    value={submissionFilters.problemId}
                    onChange={handleSubmissionFilterChange}
                  />
                </div>
              </div>

              {submissionsLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover table-sm align-middle">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Problem</th>
                          <th>Status</th>
                          <th>Language</th>
                          <th>Score</th>
                          <th>Time</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.length > 0 ? (
                          submissions.map((submission) => (
                            <tr key={submission._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="fw-bold">{submission.user.username}</span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{submission.problem.title}</div>
                                  <small className={getDifficultyColorClass(submission.problem.difficulty)}>
                                    {submission.problem.difficulty}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(submission.status)}`}>
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
                              <td>
                                <span className="text-muted">
                                  {submission.executionTime}ms
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(submission.createdAt).toLocaleString()}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-info btn-sm"
                                    title="View problem"
                                    onClick={() => window.open(`/problem/${submission.problem._id}`, '_blank')}
                                  >
                                    <i className="bi bi-file-earmark-text me-1"></i>
                                    Problem
                                  </button>
                                  <button 
                                    className="btn btn-warning btn-sm"
                                    title="View user profile"
                                    onClick={() => window.open(`/profile/${submission.user._id}`, '_blank')}
                                  >
                                    <i className="bi bi-person me-1"></i>
                                    User
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    title="Delete submission"
                                    onClick={() => handleDeleteSubmission(submission._id)}
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                  </button>
                                </div>
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

                  {/* Submission Pagination */}
                  {submissionPagination.pages > 1 && (
                    <nav aria-label="Submissions pagination" className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${submissionPagination.page === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleSubmissionPageChange(submissionPagination.page - 1)}
                            disabled={submissionPagination.page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, submissionPagination.pages) }, (_, i) => {
                          const startPage = Math.max(1, submissionPagination.page - 2);
                          const pageNum = startPage + i;
                          if (pageNum > submissionPagination.pages) return null;
                          
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${submissionPagination.page === pageNum ? "active" : ""}`}
                            >
                              <button
                                className="page-link bg-dark text-light border-secondary"
                                onClick={() => handleSubmissionPageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${submissionPagination.page === submissionPagination.pages ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleSubmissionPageChange(submissionPagination.page + 1)}
                            disabled={submissionPagination.page === submissionPagination.pages}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
