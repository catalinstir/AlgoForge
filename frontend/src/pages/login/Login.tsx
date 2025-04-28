import React, { useState } from "react";
import { UserRole } from "../../App";
import apiClient from "../../services/api";
import axios from "axios";
import { AxiosError } from "axios";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if ((isLogin && !email) || (!isLogin && (!username || !email))) {
      setError("Email (and Username for Sign Up) is required.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting login with:", { email, password });
        const response = await apiClient.post<{ token: string }>(
          "/auth/login",
          {
            email,
            password,
          }
        );
        console.log("Login successful, token received.");
        onLoginSuccess(response.data.token);
      } else {
        console.log("Attempting sign up:", { username, email, password });
        await apiClient.post("/auth/register", {
          username,
          email,
          password,
        });
        console.log("Signup successful for:", username);
        setError(null);
        alert("Registration successful! Please log in.");
        setIsLogin(true);

        setUsername("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(err)) {
        // Access err.response.data for backend error message
        errorMessage = err.response?.data?.error || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setEmail(""); // Clear email too
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    <div className="login-form-container">
      <h2 className="mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              disabled={loading}
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

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
            disabled={loading}
          />
        </div>

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
              required={!isLogin}
              disabled={loading}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="mb-0">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
