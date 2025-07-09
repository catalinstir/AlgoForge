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

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  problemsSolvedCount: number;
  problemsAttemptedCount: number;
  problemsUploadedCount: number;
  successRate: number;
  createdAt: string;
}

interface AdminProblem {
  _id: string;
  id: string;
  title: string;
  difficulty: string;
  acceptance: string;
  totalSubmissions: number;
  totalSolvers: number;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  categories?: string[];
}

interface ProblemTicket {
  _id: string;
  title: string;
  difficulty: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  status: "Pending" | "Approved" | "Rejected";
  submitter: {
    _id: string;
    username: string;
    email: string;
  };
  categories?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  testCases?: Array<{
    input: string;
    output: string;
    isHidden: boolean;
  }>;
  solutionCode?: {
    language: string;
    code: string;
  };
  suggestedIncludes?: {
    [key: string]: string[];
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
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
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
      console.log("Problems response:", response.data);
      
      const transformedProblems = Array.isArray(response.data) ? response.data.map((problem: any) => ({
        ...problem,
        id: problem.id || problem._id,
        acceptance: problem.acceptance || "0%",
        totalSubmissions: problem.totalSubmissions || 0,
        totalSolvers: problem.uniqueSolvers || 0,
        author: { _id: "loading", username: "Loading..." },
      })) : [];
      
      setProblems(transformedProblems);
      
      if (transformedProblems.length > 0) {
        try {
          const problemDetailsPromises = transformedProblems.map(async (problem) => {
            try {
              const detailResponse = await problemAPI.getProblemById(problem._id);
              return {
                problemId: problem._id,
                author: detailResponse.data.author || { _id: "unknown", username: "Unknown" }
              };
            } catch (error) {
              console.error(`Error fetching details for problem ${problem._id}:`, error);
              return {
                problemId: problem._id,
                author: { _id: "unknown", username: "Unknown" }
              };
            }
          });
          
          const problemDetails = await Promise.all(problemDetailsPromises);
          
          setProblems(prev => prev.map(problem => {
            const details = problemDetails.find(detail => detail.problemId === problem._id);
            if (details) {
              return { ...problem, author: details.author };
            }
            return problem;
          }));
        } catch (error) {
          console.error("Error fetching problem details:", error);
        }
      }
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
      console.log("Users response:", response.data);
      console.log("Sample user structure:", response.data.users?.[0]);
      
      const transformedUsers = (response.data.users || []).map((user: any) => {
        console.log(`Processing user: ${user.username}`, {
          problemsSolved: user.problemsSolved,
          problemsAttempted: user.problemsAttempted,
          problemsUploaded: user.problemsUploaded,
          successRate: user.successRate
        });
        
        const solvedCount = Array.isArray(user.problemsSolved) ? user.problemsSolved.length : (user.problemsSolvedCount || 0);
        const attemptedCount = Array.isArray(user.problemsAttempted) ? user.problemsAttempted.length : (user.problemsAttemptedCount || 0);
        const uploadedCount = Array.isArray(user.problemsUploaded) ? user.problemsUploaded.length : (user.problemsUploadedCount || 0);
        
        return {
          ...user,
          problemsSolvedCount: solvedCount,
          problemsAttemptedCount: attemptedCount,
          problemsUploadedCount: uploadedCount,
          successRate: attemptedCount > 0 ? (solvedCount / attemptedCount) * 100 : 0,
        };
      });
      
      console.log("Transformed users:", transformedUsers[0]);
      
      setUsers(transformedUsers);
      setUserPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0,
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
      setSubmissions(response.data.submissions || []);
      setSubmissionPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setSubmissionsLoading(false);
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
      setTickets(response.data.requests || []);
      setTicketPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmissionFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubmissionFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setSubmissionPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUserFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setUserPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTicketFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setTicketPagination(prev => ({ ...prev, page: 1 }));
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

  const clearUserFilters = () => {
    setUserFilters({
      search: "",
      role: "",
    });
    setUserPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearTicketFilters = () => {
    setTicketFilters({
      status: "",
    });
    setTicketPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSubmissionPageChange = (page: number) => {
    setSubmissionPagination(prev => ({ ...prev, page }));
  };

  const handleUserPageChange = (page: number) => {
    setUserPagination(prev => ({ ...prev, page }));
  };

  const handleTicketPageChange = (page: number) => {
    setTicketPagination(prev => ({ ...prev, page }));
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await userAPI.updateUserRole(userId, { role: newRole as any });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (window.confirm("Are you sure you want to delete this problem? This action cannot be undone.")) {
      try {
        await problemAPI.deleteProblem(problemId);
        fetchProblems();
      } catch (error) {
        console.error("Error deleting problem:", error);
      }
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await submissionAPI.deleteSubmission(submissionId);
        fetchSubmissions();
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          let value = "";
          
          switch (header) {
            case "User":
              value = row.username || "";
              break;
            case "Email":
              value = row.email || "";
              break;
            case "Role":
              value = row.role || "";
              break;
            case "Problems Solved":
              value = row.problemsSolvedCount || 0;
              break;
            case "Problems Attempted":
              value = row.problemsAttemptedCount || 0;
              break;
            case "Problems Uploaded":
              value = row.problemsUploadedCount || 0;
              break;
            case "Success Rate":
              value = `${(row.successRate || 0).toFixed(1)}%`;
              break;
            case "Joined":
              value = formatDate(row.createdAt);
              break;
            case "ID":
              value = row._id || "";
              break;
            case "Title":
              value = row.title || "";
              break;
            case "Difficulty":
              value = row.difficulty || "";
              break;
            case "Acceptance":
              value = row.acceptance || "";
              break;
            case "Submissions":
              value = row.totalSubmissions || 0;
              break;
            case "Solvers":
              value = row.totalSolvers || 0;
              break;
            case "Author":
              value = row.author?.username || "Unknown";
              break;
            case "Categories":
              value = Array.isArray(row.categories) ? row.categories.join("; ") : "";
              break;
            case "Problem":
              value = row.problem?.title || "Unknown Problem";
              break;
            case "Problem Difficulty":
              value = row.problem?.difficulty || "";
              break;
            case "Status":
              value = row.status || "";
              break;
            case "Language":
              value = row.language || "";
              break;
            case "Test Cases Passed":
              value = row.testCasesPassed || 0;
              break;
            case "Total Test Cases":
              value = row.totalTestCases || 0;
              break;
            case "Score":
              value = row.totalTestCases > 0 
                ? `${row.testCasesPassed || 0}/${row.totalTestCases} (${(((row.testCasesPassed || 0) / row.totalTestCases) * 100).toFixed(1)}%)`
                : "0/0 (0%)";
              break;
            case "Execution Time":
              value = `${row.executionTime || 0}ms`;
              break;
            case "Memory Used":
              value = `${row.memoryUsed || 0}MB`;
              break;
            case "Submitted":
              value = formatDate(row.createdAt);
              break;
            default:
              value = row[header] || "";
          }
          
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProblems = () => {
    const headers = ["ID", "Title", "Difficulty", "Acceptance", "Submissions", "Solvers", "Author", "Categories"];
    const filename = `problems_export_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(problems, filename, headers);
  };

  const exportUsers = () => {
    const headers = ["User", "Email", "Role", "Problems Solved", "Problems Attempted", "Problems Uploaded", "Success Rate", "Joined"];
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(users, filename, headers);
  };

  const exportSubmissions = () => {
    const headers = ["User", "Problem", "Problem Difficulty", "Status", "Language", "Score", "Execution Time", "Memory Used", "Submitted"];
    const filename = `submissions_export_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(submissions, filename, headers);
  };

  // Fixed openTicketModal to fetch full details
  const openTicketModal = async (ticket: ProblemTicket) => {
    try {
      const response = await problemRequestAPI.getRequest(ticket._id);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setSelectedTicket(ticket);
    }
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
  };

  const handleDeleteTicket = async (ticketId: string, ticketTitle: string) => {
    const confirmMessage = `Are you sure you want to delete the ticket "${ticketTitle}"?\n\nThis action cannot be undone and will permanently remove:\n- The problem submission\n- All associated data\n- Any review history`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await problemRequestAPI.deleteRequest(ticketId);
        
        fetchTickets();
        
        if (selectedTicket && selectedTicket._id === ticketId) {
          closeTicketModal();
        }
        
        alert("Ticket deleted successfully!");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket. Please try again.");
      }
    }
  };

  const handleReviewTicket = async (ticketId: string, status: "Approved" | "Rejected", feedback: string) => {
    try {
      await problemRequestAPI.reviewRequest(ticketId, { status, feedback });
      
      fetchTickets();
      closeTicketModal();
      
      alert(`Ticket ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error reviewing ticket:", error);
      alert("Failed to review ticket. Please try again.");
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const pendingTicketsCount = tickets.filter(t => t.status === "Pending").length;

  const renderPaginationButtons = (pagination: any, handlePageChange: (page: number) => void) => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(i);
    }

    return (
      <nav>
        <ul className="pagination pagination-sm justify-content-center mt-3">
          <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
            <button
              className="page-link bg-dark text-light border-secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
          </li>
          
          {pages.map((pageNum) => (
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
          ))}
          
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
    );
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

              {/* Ticket Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    name="status"
                    value={ticketFilters.status}
                    onChange={handleTicketFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {ticketsLoading ? (
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
                          <th>Title</th>
                          <th>Difficulty</th>
                          <th>Submitter</th>
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
                                <div className="fw-bold">{ticket.title}</div>
                                <small className="text-muted">
                                  {ticket.categories?.join(", ") || "No categories"}
                                </small>
                              </td>
                              <td>
                                <span className={getDifficultyColorClass(ticket.difficulty)}>
                                  {ticket.difficulty}
                                </span>
                              </td>
                              <td>
                                <div>{ticket.submitter.username}</div>
                                <small className="text-muted">{ticket.submitter.email}</small>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td>{formatDate(ticket.createdAt)}</td>
                              <td>
                                <div className="btn-group" role="group" aria-label="Ticket actions">
                                  <button
                                    className="btn btn-info btn-sm"
                                    onClick={() => openTicketModal(ticket)}
                                    title="Review ticket details"
                                  >
                                    Review
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteTicket(ticket._id, ticket.title)}
                                    title="Delete this ticket"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center text-muted p-4">
                              No tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationButtons(ticketPagination, handleTicketPageChange)}
                </>
              )}
            </div>
          )}

          {/* Problems Tab */}
          {selectedTab === "problems" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">Problems ({problems.length})</h4>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={exportProblems}
                >
                  <i className="bi bi-download me-1"></i>
                  Export CSV
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
                        <th>Author</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.length > 0 ? (
                        problems.map((problem, index) => (
                          <tr key={problem._id}>
                            <td>
                              <span className="badge bg-secondary">
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div className="fw-bold">{problem.title}</div>
                              {problem.categories && (
                                <small className="text-muted">
                                  {problem.categories.slice(0, 2).join(", ")}
                                </small>
                              )}
                            </td>
                            <td>
                              <span className={getDifficultyColorClass(problem.difficulty)}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td>{problem.acceptance}</td>
                            <td>{formatSubmissions(problem.totalSubmissions)}</td>
                            <td>{formatSubmissions(problem.totalSolvers)}</td>
                            <td>
                              <small className="text-muted">
                                {problem.author?.username || "Unknown"}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button className="btn btn-warning btn-sm">
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteProblem(problem._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center text-muted p-4">
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
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearUserFilters}
                  >
                    Clear Filters
                  </button>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={exportUsers}
                  >
                    <i className="bi bi-download me-1"></i>
                    Export CSV
                  </button>
                </div>
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
                                <div>
                                  <div className="fw-bold">{user.username}</div>
                                  <small className="text-muted">{user.email}</small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  user.role === "admin" ? "bg-danger" : 
                                  user.role === "user" ? "bg-success" : "bg-secondary"
                                }`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">
                                    {user.problemsSolvedCount}/{user.problemsAttemptedCount}
                                  </div>
                                  <small className="text-muted">
                                    {user.problemsUploadedCount} uploaded
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className={`fw-bold ${
                                  user.successRate >= 70 ? "text-success" :
                                  user.successRate >= 50 ? "text-warning" : "text-danger"
                                }`}>
                                  {user.successRate?.toFixed(1) || 0}%
                                </span>
                              </td>
                              <td>{formatDate(user.createdAt)}</td>
                              <td>
                                <div className="btn-group" role="group" aria-label="User actions">
                                  <button
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => handleUpdateUserRole(user._id, "user")}
                                    disabled={user.role === "user"}
                                    title="Make User"
                                  >
                                    User
                                  </button>
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleUpdateUserRole(user._id, "admin")}
                                    disabled={user.role === "admin"}
                                    title="Make Admin"
                                  >
                                    Admin
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => handleUpdateUserRole(user._id, "guest")}
                                    disabled={user.role === "guest"}
                                    title="Make Guest"
                                  >
                                    Guest
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center text-muted p-4">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationButtons(userPagination, handleUserPageChange)}
                </>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {selectedTab === "submissions" && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-light mb-0">All Submissions ({submissionPagination.total})</h4>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearSubmissionFilters}
                  >
                    Clear Filters
                  </button>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={exportSubmissions}
                  >
                    <i className="bi bi-download me-1"></i>
                    Export CSV
                  </button>
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
                    <option value="">All Statuses</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                    <option value="Runtime Error">Runtime Error</option>
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
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Problem ID..."
                    name="problemId"
                    value={submissionFilters.problemId}
                    onChange={handleSubmissionFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Username..."
                    name="userId"
                    value={submissionFilters.userId}
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
                                  <span className="fw-bold">
                                    {submission.user?.username || "Unknown User"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">
                                    {submission.problem?.title || "Unknown Problem"}
                                  </div>
                                  <small className={getDifficultyColorClass(submission.problem?.difficulty || "")}>
                                    {submission.problem?.difficulty || "Unknown"}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(submission.status || "")}`}>
                                  {submission.status || "Unknown"}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {(submission.language || "unknown").toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span className="fw-bold">
                                  {submission.testCasesPassed || 0}/{submission.totalTestCases || 0}
                                </span>
                                <br />
                                <small className="text-muted">
                                  {submission.totalTestCases > 0 
                                    ? (((submission.testCasesPassed || 0) / submission.totalTestCases) * 100).toFixed(1)
                                    : 0}%
                                </small>
                              </td>
                              <td>
                                <div>
                                  <div>{submission.executionTime || 0}ms</div>
                                  <small className="text-muted">{submission.memoryUsed || 0}MB</small>
                                </div>
                              </td>
                              <td>{formatDate(submission.createdAt)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button className="btn btn-info btn-sm">
                                    View
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteSubmission(submission._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center text-muted p-4">
                              No submissions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationButtons(submissionPagination, handleSubmissionPageChange)}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Review Modal - Fixed with proper null checks */}
      {selectedTicket && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Review Problem Submission</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeTicketModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Problem Details</h6>
                    <p><strong>Title:</strong> {selectedTicket.title}</p>
                    <p><strong>Difficulty:</strong> <span className={getDifficultyColorClass(selectedTicket.difficulty)}>{selectedTicket.difficulty}</span></p>
                    
                    {/* Categories - Fixed to handle undefined */}
                    {selectedTicket.categories && selectedTicket.categories.length > 0 && (
                      <p><strong>Categories:</strong> {selectedTicket.categories.join(", ")}</p>
                    )}
                    
                    <p><strong>Submitter:</strong> {selectedTicket.submitter.username} ({selectedTicket.submitter.email})</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Status Information</h6>
                    <p><strong>Current Status:</strong> <span className={`badge ${getStatusBadge(selectedTicket.status)}`}>{selectedTicket.status}</span></p>
                    <p><strong>Submitted:</strong> {formatDate(selectedTicket.createdAt)}</p>
                    {selectedTicket.reviewedAt && (
                      <p><strong>Reviewed:</strong> {formatDate(selectedTicket.reviewedAt)}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <h6>Description</h6>
                  <div className="p-3 bg-secondary rounded">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Input/Output Format - Fixed to handle undefined */}
                {(selectedTicket.inputFormat || selectedTicket.outputFormat) && (
                  <div className="mt-3">
                    <h6>Input/Output Format</h6>
                    {selectedTicket.inputFormat && (
                      <div className="mb-2">
                        <strong>Input Format:</strong>
                        <div className="p-2 bg-secondary rounded mt-1">
                          {selectedTicket.inputFormat}
                        </div>
                      </div>
                    )}
                    {selectedTicket.outputFormat && (
                      <div className="mb-2">
                        <strong>Output Format:</strong>
                        <div className="p-2 bg-secondary rounded mt-1">
                          {selectedTicket.outputFormat}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Examples - Fixed to handle undefined */}
                {selectedTicket.examples && selectedTicket.examples.length > 0 && (
                  <div className="mt-3">
                    <h6>Examples ({selectedTicket.examples.length})</h6>
                    {selectedTicket.examples.map((example, index) => (
                      <div key={index} className="mb-2 p-2 bg-secondary rounded">
                        <strong>Example {index + 1}:</strong>
                        <br />
                        <code>Input: {example.input}</code>
                        <br />
                        <code>Output: {example.output}</code>
                        {example.explanation && (
                          <>
                            <br />
                            <small>Explanation: {example.explanation}</small>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Test Cases - Fixed to handle undefined testCases */}
                {selectedTicket.testCases && selectedTicket.testCases.length > 0 ? (
                  <div className="mt-3">
                    <h6>Test Cases ({selectedTicket.testCases.length})</h6>
                    <small className="text-muted">
                      {selectedTicket.testCases.filter(tc => !tc.isHidden).length} public, 
                      {selectedTicket.testCases.filter(tc => tc.isHidden).length} hidden
                    </small>
                  </div>
                ) : (
                  <div className="mt-3">
                    <h6>Test Cases</h6>
                    <p className="text-muted">Test case details not available in summary view.</p>
                  </div>
                )}

                {/* Solution Code - Fixed to handle undefined */}
                {selectedTicket.solutionCode && (
                  <div className="mt-3">
                    <h6>Solution Code ({selectedTicket.solutionCode.language?.toUpperCase() || "Unknown"})</h6>
                    <pre className="bg-secondary p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                      <code>{selectedTicket.solutionCode.code || "No solution code provided"}</code>
                    </pre>
                  </div>
                )}

                {/* Suggested Includes - Fixed to handle undefined */}
                {selectedTicket.suggestedIncludes && Object.keys(selectedTicket.suggestedIncludes).length > 0 && (
                  <div className="mt-3">
                    <h6>Suggested Includes</h6>
                    {Object.entries(selectedTicket.suggestedIncludes).map(([lang, includes]: [string, any]) => (
                      includes && includes.length > 0 && (
                        <div key={lang} className="mb-2">
                          <strong className="text-info">{lang.toUpperCase()}:</strong>
                          <div className="mt-1">
                            {includes.map((include: string, idx: number) => (
                              <div key={idx} className="text-muted small">
                                <code>{include}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Constraints - Fixed to handle undefined */}
                {selectedTicket.constraints && selectedTicket.constraints.length > 0 && (
                  <div className="mt-3">
                    <h6>Constraints ({selectedTicket.constraints.length})</h6>
                    <ul className="list-unstyled">
                      {selectedTicket.constraints.map((constraint, index) => (
                        <li key={index} className="mb-1">
                          <code>{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTicket.feedback && (
                  <div className="mt-3">
                    <h6>Feedback</h6>
                    <div className="p-3 bg-secondary rounded">
                      {selectedTicket.feedback}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                {selectedTicket.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleReviewTicket(selectedTicket._id, "Approved", "Problem has been approved and published.")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const feedback = prompt("Please provide feedback for rejection:");
                        if (feedback) {
                          handleReviewTicket(selectedTicket._id, "Rejected", feedback);
                        }
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedTicket.status === "Approved" && selectedTicket.approvedProblem && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.open(`/problem/${selectedTicket.approvedProblem?._id}`, '_blank')}
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    View Published Problem
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeTicketModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedTicket && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminDashboard;
