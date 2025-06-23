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

// NEW: Interface for account deletion
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

export interface ProblemRequestData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  constraints: string[];
  testCases: TestCase[];
  functionName: string;
  categories: string[];
  codeTemplates: {
    [key: string]: string;
  };
  solutionCode: SolutionCode;
}

export interface ProblemData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  constraints: string[];
  testCases: TestCase[];
  functionName: string;
  categories: string[];
  codeTemplates: {
    [key: string]: string;
  };
  solutionCode?: {
    [key: string]: string;
  };
  status?: 'Draft' | 'Published';
}

export interface ProblemReviewData {
  status: 'Approved' | 'Rejected';
  feedback?: string;
}

export interface UserRoleUpdateData {
  role: 'guest' | 'user' | 'admin';
}

export interface AdminSubmissionFilterParams extends PaginationParams {
  status?: string;
  language?: string;
  problemId?: string;
  userId?: string;
}

export interface SubmissionFilterParams extends PaginationParams {
  problemId?: string;
  status?: string;
  language?: string;
}
