export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: UserRole;
  problemsSolvedCount?: number;
  problemsAttemptedCount?: number;
  problemsUploadedCount?: number;
  totalProblems?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface Problem {
  id?: string | number;
  _id?: string;
  displayIndex?: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  constraints: string[];
  acceptance?: string;
  testCases?: TestCase[];
  inputFormat?: string;
  outputFormat?: string;
  // Suggested includes/imports for each language
  suggestedIncludes?: {
    cpp?: string[];
    java?: string[];
    python?: string[];
    javascript?: string[];
  };
  author?: any;
  status?: 'Draft' | 'Published' | 'Rejected';
  publishedDate?: string;
  categories?: string[];
}

export interface Submission {
  id?: string;
  _id?: string;
  user: User;
  problem: Problem;
  code: string;
  language: string;
  status: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: string;
  passRate?: number;
}
