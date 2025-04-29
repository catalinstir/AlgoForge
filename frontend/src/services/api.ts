import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Removed /api

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
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
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      // Log out user
      localStorage.removeItem('authToken');
      // You could also redirect to login or trigger a global event
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register a new user
  register: (userData: RegisterData): Promise<AxiosResponse<any>> => 
    apiClient.post('/auth/register', userData),
  
  // Login existing user
  login: (credentials: LoginCredentials): Promise<AxiosResponse<any>> => 
    apiClient.post('/auth/login', credentials),
  
  // Get current user data
  getMe: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/auth/me'),
  
  // Update profile
  updateProfile: (data: UpdateProfileData): Promise<AxiosResponse<any>> => 
    apiClient.put('/auth/update-profile', data),
  
  // Change password
  changePassword: (data: ChangePasswordData): Promise<AxiosResponse<any>> => 
    apiClient.put('/auth/change-password', data),
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/users/me'),
  
  // Get user by ID
  getUserById: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/users/profile/${userId}`),
  
  // Get user's solved problems
  getSolvedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/users/my-solved'),
  
  // Get user's attempted problems
  getAttemptedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/users/my-attempted'),
  
  // Get user's uploaded problems
  getUploadedProblems: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/users/my-uploaded'),
  
  // Get another user's public information
  getPublicSolvedProblems: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/users/solved/${userId}`),
  
  getPublicUploadedProblems: (userId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/users/uploaded/${userId}`),
  
  // Admin functions
  getAllUsers: (params?: UserFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/users/all', { params }),
  
  updateUserRole: (userId: string, role: UserRoleUpdateData): Promise<AxiosResponse<any>> => 
    apiClient.put(`/users/${userId}/role`, role),
};

// Problem API
export const problemAPI = {
  // Get all problems
  getAllProblems: (params?: ProblemFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/problems', { params }),
  
  // Get problem by ID
  getProblemById: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/problems/${problemId}`),
  
  // Get problem categories
  getCategories: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/problems/categories'),
  
  // Get problem statistics
  getProblemStats: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/problems/${problemId}/stats`),
  
  // Admin functions
  createProblem: (problemData: ProblemData): Promise<AxiosResponse<any>> => 
    apiClient.post('/problems', problemData),
  
  updateProblem: (problemId: string, problemData: Partial<ProblemData>): Promise<AxiosResponse<any>> => 
    apiClient.put(`/problems/${problemId}`, problemData),
  
  deleteProblem: (problemId: string): Promise<AxiosResponse<any>> => 
    apiClient.delete(`/problems/${problemId}`),
};

// Submission API
export const submissionAPI = {
  // Submit a solution
  submitSolution: (data: CodeSubmissionData): Promise<AxiosResponse<any>> => 
    apiClient.post('/submissions/submit', data),
  
  // Run code without submitting
  runCode: (data: CodeSubmissionData): Promise<AxiosResponse<any>> => 
    apiClient.post('/submissions/run', data),
  
  // Get user's submissions
  getUserSubmissions: (params?: SubmissionFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/submissions', { params }),
  
  // Get submission by ID
  getSubmission: (submissionId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/submissions/${submissionId}`),
  
  // Admin function to get all submissions for a problem
  getProblemSubmissions: (
    problemId: string, 
    params?: PaginationParams
  ): Promise<AxiosResponse<any>> => 
    apiClient.get(`/submissions/problem/${problemId}`, { params }),
};

// Problem Request API
export const problemRequestAPI = {
  // Submit a problem request
  submitRequest: (data: ProblemRequestData): Promise<AxiosResponse<any>> => 
    apiClient.post('/problem-requests', data),
  
  // Get user's problem requests
  getUserRequests: (): Promise<AxiosResponse<any>> => 
    apiClient.get('/problem-requests/my-requests'),
  
  // Get a specific problem request
  getRequest: (requestId: string): Promise<AxiosResponse<any>> => 
    apiClient.get(`/problem-requests/${requestId}`),
  
  // Update a problem request
  updateRequest: (requestId: string, data: Partial<ProblemRequestData>): Promise<AxiosResponse<any>> => 
    apiClient.put(`/problem-requests/${requestId}`, data),
  
  // Cancel a problem request
  cancelRequest: (requestId: string): Promise<AxiosResponse<any>> => 
    apiClient.delete(`/problem-requests/${requestId}`),
  
  // Admin functions
  getAllRequests: (params?: ProblemRequestFilterParams): Promise<AxiosResponse<any>> => 
    apiClient.get('/problem-requests', { params }),
  
  reviewRequest: (requestId: string, data: ProblemReviewData): Promise<AxiosResponse<any>> => 
    apiClient.put(`/problem-requests/${requestId}/review`, data),
};

export default apiClient;