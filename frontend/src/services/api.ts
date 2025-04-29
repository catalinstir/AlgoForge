import axios from "axios";

// Define the base URL for your backend API
// Use VITE_API_URL environment variable or default to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      // Log out user
      localStorage.removeItem("authToken");
      // You could also redirect to login or trigger a global event
      window.location.href = "/login?session_expired=true";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register a new user
  register: (userData) => apiClient.post("/auth/register", userData),

  // Login existing user
  login: (credentials) => apiClient.post("/auth/login", credentials),

  // Get current user data
  getMe: () => apiClient.get("/auth/me"),

  // Update profile
  updateProfile: (data) => apiClient.put("/auth/update-profile", data),

  // Change password
  changePassword: (data) => apiClient.put("/auth/change-password", data),
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: () => apiClient.get("/users/me"),

  // Get user by ID
  getUserById: (userId) => apiClient.get(`/users/profile/${userId}`),

  // Get user's solved problems
  getSolvedProblems: () => apiClient.get("/users/my-solved"),

  // Get user's attempted problems
  getAttemptedProblems: () => apiClient.get("/users/my-attempted"),

  // Get user's uploaded problems
  getUploadedProblems: () => apiClient.get("/users/my-uploaded"),

  // Get another user's public information
  getPublicSolvedProblems: (userId) => apiClient.get(`/users/solved/${userId}`),
  getPublicUploadedProblems: (userId) =>
    apiClient.get(`/users/uploaded/${userId}`),

  // Admin functions
  getAllUsers: (params) => apiClient.get("/users/all", { params }),
  updateUserRole: (userId, role) =>
    apiClient.put(`/users/${userId}/role`, { role }),
};

// Problem API
export const problemAPI = {
  // Get all problems
  getAllProblems: (params) => apiClient.get("/problems", { params }),

  // Get problem by ID
  getProblemById: (problemId) => apiClient.get(`/problems/${problemId}`),

  // Get problem categories
  getCategories: () => apiClient.get("/problems/categories"),

  // Get problem statistics
  getProblemStats: (problemId) => apiClient.get(`/problems/${problemId}/stats`),

  // Admin functions
  createProblem: (problemData) => apiClient.post("/problems", problemData),
  updateProblem: (problemId, problemData) =>
    apiClient.put(`/problems/${problemId}`, problemData),
  deleteProblem: (problemId) => apiClient.delete(`/problems/${problemId}`),
};

// Submission API
export const submissionAPI = {
  // Submit a solution
  submitSolution: (data) => apiClient.post("/submissions/submit", data),

  // Run code without submitting
  runCode: (data) => apiClient.post("/submissions/run", data),

  // Get user's submissions
  getUserSubmissions: (params) => apiClient.get("/submissions", { params }),

  // Get submission by ID
  getSubmission: (submissionId) =>
    apiClient.get(`/submissions/${submissionId}`),

  // Admin function to get all submissions for a problem
  getProblemSubmissions: (problemId, params) =>
    apiClient.get(`/submissions/problem/${problemId}`, { params }),
};

// Problem Request API
export const problemRequestAPI = {
  // Submit a problem request
  submitRequest: (data) => apiClient.post("/problem-requests", data),

  // Get user's problem requests
  getUserRequests: () => apiClient.get("/problem-requests/my-requests"),

  // Get a specific problem request
  getRequest: (requestId) => apiClient.get(`/problem-requests/${requestId}`),

  // Update a problem request
  updateRequest: (requestId, data) =>
    apiClient.put(`/problem-requests/${requestId}`, data),

  // Cancel a problem request
  cancelRequest: (requestId) =>
    apiClient.delete(`/problem-requests/${requestId}`),

  // Admin functions
  getAllRequests: (params) => apiClient.get("/problem-requests", { params }),
  reviewRequest: (requestId, data) =>
    apiClient.put(`/problem-requests/${requestId}/review`, data),
};

export default apiClient;
