import React, { useState } from "react";
// import "../../styles/App.css"; // Styles likely imported globally in main.tsx or App.tsx
import { UserRole } from "../../App"; // Import shared UserRole type

interface LoginProps {
  onLoginSuccess: (username: string, role: UserRole) => void;
  // Optional: Add onCancel or similar prop if used as a modal
  // onCancel?: () => void;
}

// Predefined admin users for easy testing
const ADMIN_USERS = ["admin", "admin@algorush.com", "testadmin"]; // Added more test admins

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true); // true for Login mode, false for Sign Up mode
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // For displaying errors

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    if (!isLogin && !confirmPassword) {
      setError("Please confirm your password.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Determine user role (mock logic)
    const role: UserRole = ADMIN_USERS.includes(username.toLowerCase())
      ? "admin"
      : "user";

    if (isLogin) {
      console.log("Attempting login:", { username, password, role });
      // --- Mock Login Validation ---
      // In a real app, you would send credentials to a backend API.
      // For this mock, we'll accept any non-empty password.
      if (password) {
        console.log("Mock login successful for:", username);
        onLoginSuccess(username, role);
      } else {
        setError("Invalid credentials (mock validation)."); // Should not happen due to basic validation
      }
      // --- End Mock Login ---
    } else {
      // Sign Up Mode
      console.log("Attempting sign up:", { username, password, role });
      // --- Mock Sign Up ---
      // In a real app, you'd check if username exists, then create user.
      // For this mock, we assume signup is always successful if passwords match.
      console.log("Mock signup successful for:", username);
      onLoginSuccess(username, role); // Log in user immediately after signup
      // --- End Mock Sign Up ---
    }
  };

  // Toggle between Login and Sign Up modes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear fields and errors when switching modes
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    // Container class from App.css
    <div className="login-form-container">
      <h2 className="mb-4">{isLogin ? "Login" : "Sign Up"}</h2>

      {/* Display Error Messages */}
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Username Input */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username or Email
          </label>
          <input
            type="text" // Use text to allow email
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-describedby="usernameHelp"
          />
          {/* Helper text for admin login */}
          <small id="usernameHelp" className="form-text text-muted">
            Try 'admin' or 'testadmin' for admin access.
          </small>
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Confirm Password Input (Sign Up only) */}
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={!isLogin} // Only required in sign up mode
            />
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {/* Toggle Mode Link */}
      <div className="mt-4 text-center">
        <p className="mb-0">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={toggleMode}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
