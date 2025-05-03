import React, { useState, useEffect, useCallback } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Login from "./pages/login/Login";
import Navbar from "./components/Navbar";
import ProblemList from "./components/ProblemList";
import ProblemDetails from "./pages/problem/ProblemDetails";
import Profile from "./pages/profile/Profile";
import Forums from "./pages/forums/Forums";
import Browse from "./pages/browse/Browse";
import AdminDashboard from "./pages/admin/AdminDashboard";
import apiClient, { userAPI, authAPI } from "./services/api";
import { User, UserRole } from "./types";

const BackgroundManager = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const showBackgroundRoutes = [
    "/login",
    "/problems",
    "/browse",
    "/forums",
    "/profile",
    "/settings",
    "/admin",
    "/",
  ];

  const path = location.pathname;

  const showBackground =
    showBackgroundRoutes.some((route) => path === route) &&
    !/^\/problem\/\d+/.test(path);

  return (
    <>
      {showBackground && <div className="sliding-background"></div>}
      {children}
    </>
  );
};

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = useCallback(async () => {
    console.log("Attempting to fetch user data...");
    try {
      const response = await userAPI.getProfile();
      console.log("User data fetched successfully:", response.data);
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      return response.data;
    } catch (userError) {
      console.error(
        "Error with user endpoint, trying auth endpoint:",
        userError
      );

      // If user endpoint fails, try the auth endpoint
      try {
        const authResponse = await authAPI.getMe();
        console.log("Auth data fetched successfully:", authResponse.data);
        setCurrentUser(authResponse.data);
        setIsLoggedIn(true);
        return authResponse.data;
      } catch (authError) {
        console.error(
          "Failed to fetch user data from both endpoints:",
          authError
        );

        // Show more detailed error information for debugging
        if (axios.isAxiosError(authError)) {
          console.error(
            "Auth error details:",
            authError.response?.data || authError.message
          );
        }

        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setCurrentUser(null);
        return null;
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        console.log("Token found in localStorage, verifying...");
        await fetchUserData();
      } else {
        console.log("No token found in localStorage.");
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [fetchUserData]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLoginSuccess = async (token: string) => {
    console.log("Login successful, storing token...");
    localStorage.setItem("authToken", token);
    setIsLoading(true);
    const userData = await fetchUserData();
    setIsLoading(false);
    if (userData) {
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        const from = location.state?.from?.pathname || "/problems";
        navigate(from, { replace: true });
      }
    } else {
      setError("Login succeeded but failed to load user details.");
      handleLogout();
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div
        className="app-container d-flex justify-content-center align-items-center"
        style={{ height: "100vh", backgroundColor: "#212529" }}
      >
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  interface ProtectedRouteProps {
    children: React.ReactElement;
    roleRequired?: UserRole;
  }
  const ProtectedRoute = ({ children, roleRequired }: ProtectedRouteProps) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roleRequired && currentUser?.role !== roleRequired) {
      console.warn(
        `Access denied for ${currentUser?.username} to route requiring role: ${roleRequired}. Current role: ${currentUser?.role}`
      );
      return <Navigate to="/problems" replace />;
    }

    return children;
  };

  return (
    <div className="app-container">
      <BackgroundManager>
        <div className="content-container">
          <Navbar
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLoginClick={handleLoginClick}
            onLogout={handleLogout}
          />

          {error && (
            <div className="alert alert-danger m-3" role="alert">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/problems" />} />

            <Route
              path="/problems"
              element={
                <div className="container main-content p-4">
                  <ProblemList />
                </div>
              }
            />
            <Route
              path="/problem/:problemId"
              element={<ProblemDetails currentUser={currentUser} />}
            />
            <Route
              path="/browse"
              element={
                <div className="container main-content p-4">
                  <Browse />
                </div>
              }
            />
            <Route
              path="/forums"
              element={
                <div className="container main-content p-4">
                  <Forums />
                </div>
              }
            />

            <Route
              path="/login"
              element={
                !isLoggedIn ? (
                  <div className="container d-flex justify-content-center align-items-center login-page-container">
                    <Login onLoginSuccess={handleLoginSuccess} />
                  </div>
                ) : (
                  <Navigate to="/problems" />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="container main-content p-4">
                    <Profile user={currentUser} />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <div className="container main-content p-4 text-light">
                    <h2>Settings</h2>
                    <p>Settings page content goes here.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <div className="container main-content p-4">
                    <AdminDashboard currentUser={currentUser} />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/problems" />} />
          </Routes>
        </div>
      </BackgroundManager>
    </div>
  );
};

export default AppContent;
