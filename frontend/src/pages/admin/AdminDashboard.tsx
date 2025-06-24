import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { problemAPI, submissionAPI, userAPI, problemRequestAPI } from "../../services/api";

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

interface ProblemTicket {
  _id: string;
  title: string;
  difficulty: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  submitter: {
    _id: string;
    username: string;
    email: string;
  };
  categories: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  testCases: Array<{
    input: string;
    output: string;
    isHidden: boolean;
  }>;
  solutionCode: {
    language: string;
    code: string;
  };
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  approvedProblem?: {
    _id: string;
    title: string;
  };
}

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("tickets");
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<ProblemTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ProblemTicket | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  
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
  const [ticketFilters, setTicketFilters] = useState({
    status: "",
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
  const [ticketPagination, setTicketPagination] = useState({
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
    } else if (selectedTab === "tickets") {
      fetchTickets();
    }
  }, [selectedTab, submissionFilters, submissionPagination.page, userFilters, userPagination.page, ticketFilters, ticketPagination.page]);

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

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const params: any = {
        page: ticketPagination.page,
        limit: ticketPagination.limit,
      };
      
      if (ticketFilters.status) params.status = ticketFilters.status;

      const response = await problemRequestAPI.getAllRequests(params);
      setTickets(response.data.requests);
      setTicketPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setTicketsLoading(false);
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

  const handleTicketFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTicketFilters(prev => ({ ...prev, [name]: value }));
    setTicketPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTicketPageChange = (newPage: number) => {
    setTicketPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearTicketFilters = () => {
    setTicketFilters({
      status: "",
    });
    setTicketPagination(prev => ({ ...prev, page: 1 }));
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
      fetchSubmissions();
      alert("Submission deleted successfully.");
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    }
  };

  const handleReviewTicket = async (ticketId: string, action: "Approved" | "Rejected", feedback?: string) => {
    const actionText = action.toLowerCase();
    
    if (action === "Rejected" && !feedback) {
      feedback = prompt("Please provide feedback for rejection:");
      if (!feedback || feedback.trim() === "") {
        alert("Feedback is required for rejection.");
        return;
      }
    }

    if (!window.confirm(`Are you sure you want to ${actionText} this problem submission?`)) {
      return;
    }

    try {
      await problemRequestAPI.reviewRequest(ticketId, { 
        status: action, 
        feedback: feedback || `Problem ${actionText} by admin.`
      });
      
      // Refresh the tickets list
      fetchTickets();
      
      // Close the modal if it was open
      setSelectedTicket(null);
      
      alert(`Problem ${actionText} successfully.`);
    } catch (error) {
      console.error(`Error ${actionText} ticket:`, error);
      alert(`Failed to ${actionText} problem. Please try again.`);
    }
  };

  const openTicketModal = async (ticketId: string) => {
    try {
      const response = await problemRequestAPI.getRequest(ticketId);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      alert("Failed to load ticket details.");
    }
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
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
      case "approved":
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

  const pendingTicketsCount = tickets.filter(t => t.status === "Pending").length;

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
                selectedTab === "tickets" ? "active" : "text-muted"
              }`}
              onClick={() => setSelectedTab("tickets")}
              type="button"
            >
              Review Tickets
              {pendingTicketsCount > 0 && (
                <span className="badge bg-warning text-dark ms-1">
                  {pendingTicketsCount}
                </span>
              )}
            </button>
          </li>
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
          {/* Tickets Tab */}
          {selectedTab === "tickets" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">
                  Problem Submission Tickets 
                  <span className="badge bg-info ms-2">{ticketPagination.total}</span>
                </h4>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearTicketFilters}
                  >
                    Clear Filters
                  </button>
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={fetchTickets}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Ticket Summary Stats */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-dark text-light border-warning">
                    <div className="card-body text-center">
                      <div className="fs-3 text-warning">{pendingTicketsCount}</div>
                      <div className="text-muted">Pending Review</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-dark text-light border-success">
                    <div className="card-body text-center">
                      <div className="fs-3 text-success">
                        {tickets.filter(t => t.status === "Approved").length}
                      </div>
                      <div className="text-muted">Approved</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-dark text-light border-danger">
                    <div className="card-body text-center">
                      <div className="fs-3 text-danger">
                        {tickets.filter(t => t.status === "Rejected").length}
                      </div>
                      <div className="text-muted">Rejected</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-dark text-light border-info">
                    <div className="card-body text-center">
                      <div className="fs-3 text-info">{ticketPagination.total}</div>
                      <div className="text-muted">Total Tickets</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    name="status"
                    value={ticketFilters.status}
                    onChange={handleTicketFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {ticketsLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading tickets...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Problem</th>
                          <th>Submitter</th>
                          <th>Difficulty</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.length > 0 ? (
                          tickets.map((ticket) => (
                            <tr key={ticket._id}>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">{ticket.title}</span>
                                  <small className="text-muted">
                                    {ticket.description.length > 80
                                      ? `${ticket.description.substring(0, 80)}...`
                                      : ticket.description}
                                  </small>
                                  {ticket.categories && ticket.categories.length > 0 && (
                                    <div className="mt-1">
                                      {ticket.categories.slice(0, 2).map((cat: string, idx: number) => (
                                        <span key={idx} className="badge bg-info me-1" style={{ fontSize: "0.6rem" }}>
                                          {cat}
                                        </span>
                                      ))}
                                      {ticket.categories.length > 2 && (
                                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                                          +{ticket.categories.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">{ticket.submitter?.username || "Unknown"}</span>
                                  <small className="text-muted">{ticket.submitter?.email || ""}</small>
                                </div>
                              </td>
                              <td>
                                <span className={getDifficultyColorClass(ticket.difficulty)}>
                                  {ticket.difficulty}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-info btn-sm"
                                    title="View details"
                                    onClick={() => openTicketModal(ticket._id)}
                                  >
                                    <i className="bi bi-eye">Details</i>
                                  </button>
                                  {ticket.status === "Pending" && (
                                    <>
                                      <button 
                                        className="btn btn-success btn-sm"
                                        title="Approve"
                                        onClick={() => handleReviewTicket(ticket._id, "Approved")}
                                      >
                                        <i className="bi bi-check-lg">Approve</i>
                                      </button>
                                      <button 
                                        className="btn btn-danger btn-sm"
                                        title="Reject"
                                        onClick={() => handleReviewTicket(ticket._id, "Rejected")}
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </>
                                  )}
                                  {ticket.feedback && (
                                    <button 
                                      className="btn btn-outline-secondary btn-sm"
                                      title="View feedback"
                                      onClick={() => alert(`Feedback: ${ticket.feedback}`)}
                                    >
                                      <i className="bi bi-chat-square-text">Feedback</i>
                                    </button>
                                  )}
                                  {ticket.status === "Approved" && ticket.approvedProblem && (
                                    <button 
                                      className="btn btn-outline-primary btn-sm"
                                      title="View published problem"
                                      onClick={() => window.open(`/problem/${ticket.approvedProblem._id}`, '_blank')}
                                    >
                                      <i className="bi bi-arrow-right"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-3">
                              No tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Ticket Pagination */}
                  {ticketPagination.pages > 1 && (
                    <nav aria-label="Tickets pagination" className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${ticketPagination.page === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleTicketPageChange(ticketPagination.page - 1)}
                            disabled={ticketPagination.page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, ticketPagination.pages) }, (_, i) => {
                          const startPage = Math.max(1, ticketPagination.page - 2);
                          const pageNum = startPage + i;
                          if (pageNum > ticketPagination.pages) return null;
                          
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${ticketPagination.page === pageNum ? "active" : ""}`}
                            >
                              <button
                                className="page-link bg-dark text-light border-secondary"
                                onClick={() => handleTicketPageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${ticketPagination.page === ticketPagination.pages ? "disabled" : ""}`}>
                          <button
                            className="page-link bg-dark text-light border-secondary"
                            onClick={() => handleTicketPageChange(ticketPagination.page + 1)}
                            disabled={ticketPagination.page === ticketPagination.pages}
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
                                    <i className="bi bi-person">Profile</i>
                                  </button>
                                  <div className="dropdown">
                                    <button 
                                      className="btn btn-warning btn-sm dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                      title="Change role"
                                    >
                                      <i className="bi bi-gear">Role</i>
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
                                    <i className="bi bi-ban">Ban/Unban</i>
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
                            <td colSpan={8} className="text-center py-3">
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content bg-dark text-light border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">
                  <i className="bi bi-ticket-detailed me-2"></i>
                  Problem Submission Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeTicketModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    {/* Problem Details */}
                    <div className="card bg-dark border-secondary text-muted mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Problem Information</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Title:</strong> {selectedTicket.title}
                        </div>
                        <div className="mb-3">
                          <strong>Difficulty:</strong> 
                          <span className={`ms-2 ${getDifficultyColorClass(selectedTicket.difficulty)}`}>
                            {selectedTicket.difficulty}
                          </span>
                        </div>
                        <div className="mb-3">
                          <strong>Categories:</strong>
                          <div className="mt-1">
                            {selectedTicket.categories.map((cat, idx) => (
                              <span key={idx} className="badge bg-info me-1">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Description:</strong>
                          <div className="mt-2 p-3 bg-darker rounded">
                            {selectedTicket.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="card bg-dark border-secondary text-muted mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Examples</h6>
                      </div>
                      <div className="card-body">
                        {selectedTicket.examples.map((example, idx) => (
                          <div key={idx} className="mb-3">
                            <strong>Example {idx + 1}:</strong>
                            <div className="mt-2">
                              <div className="mb-2">
                                <strong>Input:</strong>
                                <pre className="bg-secondary p-2 rounded mt-1">{example.input}</pre>
                              </div>
                              <div className="mb-2">
                                <strong>Output:</strong>
                                <pre className="bg-secondary p-2 rounded mt-1">{example.output}</pre>
                              </div>
                              {example.explanation && (
                                <div>
                                  <strong>Explanation:</strong> {example.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solution Code */}
                    <div className="card bg-dark border-secondary text-muted">
                      <div className="card-header">
                        <h6 className="mb-0">Solution Code ({selectedTicket.solutionCode.language.toUpperCase()})</h6>
                      </div>
                      <div className="card-body">
                        <pre className="p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                          <code>{selectedTicket.solutionCode.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Submission Info */}
                    <div className="card bg-dark border-secondary text-muted mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Submission Info</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Status:</strong>
                          <span className={`badge ms-2 ${getStatusBadge(selectedTicket.status)}`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <strong>Submitter:</strong> {selectedTicket.submitter.username}
                        </div>
                        <div className="mb-3">
                          <strong>Email:</strong> {selectedTicket.submitter.email}
                        </div>
                        <div className="mb-3">
                          <strong>Submitted:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                        </div>
                        {selectedTicket.reviewedAt && (
                          <div className="mb-3">
                            <strong>Reviewed:</strong> {new Date(selectedTicket.reviewedAt).toLocaleString()}
                          </div>
                        )}
                        {selectedTicket.feedback && (
                          <div className="mb-3">
                            <strong>Feedback:</strong>
                            <div className="mt-2 p-2 bg-secondary rounded">
                              {selectedTicket.feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Constraints */}
                    <div className="card bg-dark border-secondary text-muted mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Constraints</h6>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled">
                          {selectedTicket.constraints.map((constraint, idx) => (
                            <li key={idx} className="mb-1">
                              <code>{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Test Cases Count */}
                    <div className="card bg-dark border-secondary text-muted">
                      <div className="card-header">
                        <h6 className="mb-0">Test Cases</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Total:</strong> {selectedTicket.testCases.length}
                        </div>
                        <div className="mb-2">
                          <strong>Hidden:</strong> {selectedTicket.testCases.filter(tc => tc.isHidden).length}
                        </div>
                        <div>
                          <strong>Visible:</strong> {selectedTicket.testCases.filter(tc => !tc.isHidden).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeTicketModal}
                >
                  Close
                </button>
                {selectedTicket.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleReviewTicket(selectedTicket._id, "Rejected")}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      Reject
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleReviewTicket(selectedTicket._id, "Approved")}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      Approve
                    </button>
                  </>
                )}
                {selectedTicket.status === "Approved" && selectedTicket.approvedProblem && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.open(`/problem/${selectedTicket.approvedProblem._id}`, '_blank')}
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    View Published Problem
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
