import React from "react";
import { Link, NavLink } from "react-router-dom"; // Use NavLink for active styling
import { User } from "../App"; // Import User type

interface NavbarProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLoginClick: () => void; // Function to trigger login modal/page
  onLogout: () => void;
}

const Navbar = ({
  isLoggedIn,
  currentUser,
  onLoginClick,
  onLogout,
}: NavbarProps) => {
  return (
    // Navbar styling from App.css
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container-fluid">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold fs-3 me-4" to="/">
          &lt;<span style={{ color: "#736efa" }}>/</span>&gt; Algo
          <span style={{ color: "#736efa" }}>Rush</span>
        </Link>

        {/* Navbar Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {/* Use NavLink for active class */}
              <NavLink className="nav-link" to="/problems">
                Problems
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/browse">
                Browse
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/forums">
                Forums
              </NavLink>
            </li>
            {/* Admin Dashboard Link (conditional) */}
            {isLoggedIn && currentUser?.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  <span className="badge bg-danger me-1">Admin</span>
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right side - User/Login */}
          <div className="d-flex align-items-center">
            {isLoggedIn && currentUser ? (
              // User Dropdown Menu
              <div className="dropdown">
                <button
                  className="btn btn-dark dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {/* Optional: Add avatar/icon here */}
                  <span className="me-2">{currentUser.username}</span>
                  {/* Progress Badge */}
                  <span className="badge bg-primary me-1">
                    {currentUser.problemsSolved}/{currentUser.totalProblems}
                  </span>
                  {/* Admin Badge */}
                  {currentUser.role === "admin" && (
                    <span className="badge bg-danger">Admin</span>
                  )}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={onLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              // Login Button
              <button
                className="btn btn-outline-light"
                type="button"
                onClick={onLoginClick} // Trigger login modal/page
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
