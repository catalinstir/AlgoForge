import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login/Login";
import Navbar from "./components/Navbar";
import ProblemList from "./components/ProblemList";
import Profile from "./pages/profile/Profile";
import Forums from "./pages/forums/Forums";
import Browse from "./pages/browse/Browse";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Define user roles
export type UserRole = "guest" | "user" | "admin";

// Define user type
export interface User {
  username: string;
  role: UserRole;
  problemsSolved: number;
  totalProblems: number;
}

const App = () => {
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if user was previously logged in (using localStorage in this mock version)
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginClick = () => {
    setShowLoginPage(true);
  };

  const handleLoginSuccess = (username: string, role: UserRole = "user") => {
    // Create a mock user with some solved problems
    const newUser: User = {
      username,
      role,
      problemsSolved: Math.floor(Math.random() * 5) + 1, // Random number between 1-5
      totalProblems: 10,
    };

    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowLoginPage(false);

    // Save user to localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <Router>
      <div className="app-container">
        {(showLoginPage || window.location.pathname === "/problems") && (
          <div className="sliding-background"></div>
        )}

        <div className="content-container">
          <Navbar
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLoginClick={handleLoginClick}
            onLogout={handleLogout}
          />

          {showLoginPage ? (
            <div className="container d-flex justify-content-center align-items-center login-page-container">
              <Login onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
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
                path="/admin"
                element={
                  isLoggedIn && currentUser?.role === "admin" ? (
                    <div className="container main-content p-4">
                      <AdminDashboard currentUser={currentUser} />
                    </div>
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  <div className="container d-flex justify-content-center align-items-center login-page-container">
                    <Login onLoginSuccess={handleLoginSuccess} />
                  </div>
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
