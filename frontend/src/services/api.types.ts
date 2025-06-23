export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProblemFilterParams extends PaginationParams {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  search?: string;
}

export interface UserFilterParams extends PaginationParams {
  search?: string;
  role?: 'guest' | 'user' | 'admin';
  sort?: string;
}

export interface SubmissionFilterParams extends PaginationParams {
  problemId?: string;
  status?: string;
  language?: string;
}

export interface AdminSubmissionFilterParams extends PaginationParams {
  status?: string;
  language?: string;
  problemId?: string;
  userId?: string;
}

export interface ProblemRequestFilterParams extends PaginationParams {
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface CodeSubmissionData {
  problemId: string;
  code: string;
  language: string;
}

export interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface SolutionCode {
  language: string;
  code: string;
}

export interface SuggestedIncludes {
  cpp?: string[];
  java?: string[];
  python?: string[];
  javascript?: string[];
}

export interface ProblemRequestData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  constraints: string[];
  testCases: TestCase[];
  functionName: string;
  categories: string[];
  codeTemplates: {
    [key: string]: string;
  };
  solutionCode: SolutionCode;
  suggestedIncludes?: SuggestedIncludes;
}

export interface ProblemData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  examples: Example[];
  constraints: string[];
  testCases: TestCase[];
  functionName: string;
  categories: string[];
  codeTemplates: {
    [key: string]: string;
  };
  fullSourceTemplates?: {
    [key: string]: string;
  };
  solutionCode?: {
    [key: string]: string;
  };
  suggestedIncludes?: SuggestedIncludes;
  status?: 'Draft' | 'Published';
}

export interface ProblemReviewData {
  status: 'Approved' | 'Rejected';
  feedback?: string;
}

export interface UserRoleUpdateData {
  role: 'guest' | 'user' | 'admin';
}

// Response interfaces for API calls
export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProblemsResponse {
  data: any[];
}

export interface UsersResponse {
  users: any[];
  pagination: PaginationResponse;
}

export interface SubmissionsResponse {
  submissions: any[];
  pagination: PaginationResponse;
}

export interface ProblemRequestsResponse {
  requests: any[];
  pagination: PaginationResponse;
}

export interface AuthResponse {
  token: string;
  user: any;
  message?: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  problemsSolvedCount: number;
  problemsAttemptedCount: number;
  problemsUploadedCount: number;
  totalProblems: number;
  successRate: number;
  solvedByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  problemsByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  createdAt: string;
}

export interface SubmissionResponse {
  submission: {
    id: string;
    status: string;
    executionTime: number;
    memoryUsed: number;
    testCasesPassed: number;
    totalTestCases: number;
    passRate?: number;
  };
  testResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    hidden?: boolean;
  }>;
  userStats?: {
    problemsSolvedCount: number;
    problemsAttemptedCount: number;
    isNewSolve?: boolean;
  };
}

export interface RunCodeResponse {
  status: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }>;
}

export interface ProblemRequestSubmissionResponse {
  message: string;
  requestId: string;
}

export interface ProblemRequestReviewResponse {
  message: string;
  request: any;
  problem?: {
    id: string;
    title: string;
  };
}

// Error response interface
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}
