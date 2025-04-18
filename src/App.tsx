import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/login/Login";
import Navbar from "./components/Navbar";
import ProblemList from "./components/ProblemList";
import ProblemDetails from "./pages/problem/ProblemDetails";
import Profile from "./pages/profile/Profile";
import Forums from "./pages/forums/Forums";
import Browse from "./pages/browse/Browse";
import AdminDashboard from "./pages/admin/AdminDashboard";

export type UserRole = "guest" | "user" | "admin";

export interface User {
  username: string;
  role: UserRole;
  problemsSolved: number;
  totalProblems: number;
}

export interface Problem {
  id: number;
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
  uploadedBy?: string;
  functionName?: string;
  codeTemplates?: {
    [key: string]: string;
  };
}

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

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (
          parsedUser &&
          typeof parsedUser.username === "string" &&
          typeof parsedUser.role === "string"
        ) {
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          console.error("Invalid user data found in localStorage");
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLoginSuccess = (username: string, role: UserRole = "user") => {
    const newUser: User = {
      username,
      role,
      problemsSolved: Math.floor(Math.random() * 5) + 1,
      totalProblems: 10,
    };

    setCurrentUser(newUser);
    setIsLoggedIn(true);

    try {
      localStorage.setItem("currentUser", JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
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
              path="/profile"
              element={
                isLoggedIn ? (
                  <div className="container main-content p-4">
                    <Profile user={currentUser} />
                  </div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/settings"
              element={
                isLoggedIn ? (
                  <div className="container main-content p-4 text-light">
                    <h2>Settings</h2>
                    <p>Settings page content goes here.</p>
                  </div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/admin"
              element={
                isLoggedIn && currentUser?.role === "admin" ? (
                  <div className="container main-content p-4">
                    <AdminDashboard currentUser={currentUser} />
                  </div>
                ) : (
                  <Navigate to="/problems" />
                )
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

            <Route path="*" element={<Navigate to="/problems" />} />
          </Routes>
        </div>
      </BackgroundManager>
    </div>
  );
};

export default App;
