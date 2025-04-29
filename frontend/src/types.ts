// types.ts - Place this in your src directory
export type UserRole = "guest" | "user" | "admin";

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  username: string;
  email: string;
  role: UserRole;
  problemsSolved?: string[]; // Array of problemIds
  problemsAttempted?: string[]; // Array of problemIds
  problemsUploaded?: string[]; // Array of problemIds
  problemsSolvedCount?: number;
  problemsAttemptedCount?: number;
  problemsUploadedCount?: number;
  totalProblems?: number;
  totalSubmissions?: number;
  successRate?: number;
  forumLikes?: number;
  createdAt?: string;
  lastActive?: string;
}

export interface Problem {
  _id: string;
  id?: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  acceptance?: string;
  examples?: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints?: string[];
  testCases?: {
    input: string;
    output: string;
    isHidden?: boolean;
  }[];
  functionName?: string;
  categories?: string[];
  codeTemplates?: {
    [key: string]: string;
  };
  author?: string | { _id: string; username: string };
  status?: "Draft" | "Pending" | "Published" | "Rejected";
  publishedDate?: string;
  totalSubmissions?: number;
  successfulSubmissions?: number;
}

export interface Submission {
  _id: string;
  user: string | User;
  problem: string | Problem;
  code: string;
  language: string;
  status: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults?: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    hidden?: boolean;
  }[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemRequest {
  _id: string;
  submitter: string | User;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    output: string;
    isHidden?: boolean;
  }[];
  functionName: string;
  codeTemplates: {
    [key: string]: string;
  };
  solutionCode: {
    language: string;
    code: string;
  };
  categories: string[];
  status: "Pending" | "Approved" | "Rejected";
  reviewedBy?: string | User;
  reviewedAt?: string;
  feedback?: string;
  approvedProblem?: string | Problem;
  createdAt: string;
  updatedAt: string;
}