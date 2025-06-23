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
import Settings from "./pages/settings/Settings";
import Forums from "./pages/forums/Forums";
import Browse from "./pages/browse/Browse"; // ADD THIS
import PublishProblem from "./pages/publish/PublishProblem"; // ADD THIS
import MyProblems from "./pages/my-problems/MyProblems"; // ADD THIS
import AdminDashboard from "./pages/admin/AdminDashboard";
import apiClient, { userAPI, authAPI } from "./services/api";
import { User, UserRole } from "./types";

const BackgroundManager = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const showBackgroundRoutes = [
    "/login",
    "/problems",
    "/browse",
    "/publish", // ADD THIS
    "/my-problems", // ADD THIS
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
      try {
        const authResponse = await authAPI.getCurrentUser();
        console.log("User data fetched from auth endpoint:", authResponse.data);
        setCurrentUser(authResponse.data);
        setIsLoggedIn(true);
        return authResponse.data;
      } catch (authError) {
        console.error("Both endpoints failed:", authError);
        throw authError;
      }
    }
  }, []);

  const handleUserStatsUpdate = useCallback((updatedStats: Partial<User>) => {
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev!,
        ...updatedStats
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, [fetchUserData]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLoginSuccess = async (userData: User) => {
    console.log("Login successful, user data:", userData);
    try {
      // The token is already stored by Login component
      // Just fetch fresh user data
      const freshUserData = await fetchUserData();
      
      if (freshUserData) {
        const from = location.state?.from?.pathname || "/problems";
        navigate(from, { replace: true });
      } else {
        throw new Error("Failed to fetch user data after login");
      }
    } catch (error) {
      console.error("Error fetching user data after login:", error);
      setError("Failed to load user data. Please try logging in again.");
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
              element={
                <ProblemDetails 
                  currentUser={currentUser} 
                  onUserStatsUpdate={handleUserStatsUpdate}
                />
              }
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
                  <div className="container main-content p-4">
                    <Settings user={currentUser} onLogout={handleLogout} />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* ADD THESE ROUTES */}
            <Route
              path="/publish"
              element={
                <ProtectedRoute>
                  <div className="container main-content p-4">
                    <PublishProblem currentUser={currentUser} />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-problems"
              element={
                <ProtectedRoute>
                  <div className="container main-content p-4">
                    <MyProblems currentUser={currentUser} />
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
