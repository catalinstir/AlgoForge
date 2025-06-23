import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  DeleteAccountData, // NEW
  PaginationParams,
  ProblemFilterParams,
  UserFilterParams,
  SubmissionFilterParams,
  ProblemRequestFilterParams,
  CodeSubmissionData,
  ProblemData,
  ProblemRequestData,
  ProblemReviewData,
  UserRoleUpdateData
} from './api.types';

// Define the base URL for your backend API
// Make sure VITE_API_URL doesn't already include '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create the API client WITHOUT including /api in the base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    // For debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('authToken');
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
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    // Only redirect to login if it's a 401 AND we're not already on the login page
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already on login/register pages
      if (!currentPath.includes('/login')) {
        console.log('Session expired, redirecting to login...');
        localStorage.removeItem('authToken');
        window.location.href = '/login?session_expired=true';
      }
    }
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register a new user
  register: (userData: RegisterData): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/auth/register', userData),
  
  // Login existing user
  login: (credentials: LoginCredentials): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/auth/login', credentials),
  
  // Get current user data
  getMe: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/auth/me'),
  
  // Update profile
  updateProfile: (data: UpdateProfileData): Promise<AxiosResponse<any>> => 
    apiClient.put('/api/auth/update-profile', data),
  
  // Change password
  changePassword: (data: ChangePasswordData): Promise<AxiosResponse<any>> => 
    apiClient.put('/api/auth/change-password', data),
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/users/me'),
  
  // Get user by ID
  getUserById: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/users/profile/${userId}`),
  
  // Get user's solved problems
  getSolvedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/users/my-solved'),
  
  // Get user's attempted problems
  getAttemptedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/users/my-attempted'),
  
  // Get user's uploaded problems
  getUploadedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/users/my-uploaded'),
  
  // Get another user's public information
  getPublicSolvedProblems: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/users/solved/${userId}`),
  
  getPublicUploadedProblems: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/users/uploaded/${userId}`),
  
  // NEW: Delete account
  deleteAccount: (data: DeleteAccountData): Promise<AxiosResponse<any>> => 
    apiClient.delete('/api/users/delete-account', { data }),
  
  // Admin functions
  getAllUsers: (params?: UserFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/users/all', { params }),
  
  updateUserRole: (userId: string, role: UserRoleUpdateData): Promise<AxiosResponse<any>> => 
    apiClient.put(`/api/users/${userId}/role`, role),
};

// Problem API
export const problemAPI = {
  // Get all problems
  getAllProblems: (params?: ProblemFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/problems', { params }),
  
  // Get problem by ID
  getProblemById: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/problems/${problemId}`),
  
  // Get problem categories
  getCategories: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/problems/categories'),
  
  // Get problem statistics
  getProblemStats: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/problems/${problemId}/stats`),
  
  // Admin functions
  createProblem: (problemData: ProblemData): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/problems', problemData),
  
  updateProblem: (problemId: string, problemData: Partial<ProblemData>): Promise<AxiosResponse<any>> => 
    apiClient.put(`/api/problems/${problemId}`, problemData),
  
  deleteProblem: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.delete(`/api/problems/${problemId}`),
};

// Submission API
export const submissionAPI = {
  // Submit a solution
  submitSolution: (data: CodeSubmissionData): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/submissions/submit', data),
  
  // Run code without submitting
  runCode: (data: CodeSubmissionData): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/submissions/run', data),
  
  // Get user's submissions
  getUserSubmissions: (params?: SubmissionFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/submissions', { params }),
  
  // Get submission by ID
  getSubmission: (submissionId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/submissions/${submissionId}`),

  // Admin function to get all submissions for a problem
  getProblemSubmissions: (
    problemId: string, 
    params?: PaginationParams
  ): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/submissions/problem/${problemId}`, { params }),

  // NEW: Admin functions for submission management
  getAllSubmissions: (params?: AdminSubmissionFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/submissions/admin/all', { params }),
  
  getSubmissionDetails: (submissionId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/submissions/admin/details/${submissionId}`),
  
  deleteSubmission: (submissionId: string): Promise<AxiosResponse<any>> => 
    apiClient.delete(`/api/submissions/admin/${submissionId}`),
};

// Problem Request API
export const problemRequestAPI = {
  // Submit a problem request
  submitRequest: (data: ProblemRequestData): Promise<AxiosResponse<any>> => 
    apiClient.post('/api/problem-requests', data),
  
  // Get user's problem requests
  getUserRequests: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/problem-requests/my-requests'),
  
  // Get a specific problem request
  getRequest: (requestId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/api/problem-requests/${requestId}`),
  
  // Update a problem request
  updateRequest: (requestId: string, data: Partial<ProblemRequestData>): Promise<AxiosResponse<any>> => 
    apiClient.put(`/api/problem-requests/${requestId}`, data),
  
  // Cancel a problem request
  cancelRequest: (requestId: string): Promise<AxiosResponse<any>> => 
    apiClient.delete(`/api/problem-requests/${requestId}`),
  
  // Admin functions
  getAllRequests: (params?: ProblemRequestFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/api/problem-requests', { params }),
  
  reviewRequest: (requestId: string, data: ProblemReviewData): Promise<AxiosResponse<any>> => 
    apiClient.put(`/api/problem-requests/${requestId}/review`, data),
};

export default apiClient;
