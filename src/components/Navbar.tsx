import { useState } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onLoginClick: () => void;
}

const Navbar = ({ isLoggedIn, username, onLoginClick }: NavbarProps) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold fs-3" href="#">
          &lt;<span style={{ color: "#736efa" }}>/</span>&gt; Algo
          <span style={{ color: "#736efa" }}>Rush</span>
        </a>
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="#">
                Problems
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Browse
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Forums
              </a>
            </li>
          </ul>
          <div className="d-flex">
            {isLoggedIn ? (
              <div className="dropdown">
                <button
                  className="btn btn-dark dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {username}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <a className="dropdown-item" href="#">
                      Profile
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Settings
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                className="btn btn-outline-light"
                type="button"
                onClick={onLoginClick}
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
