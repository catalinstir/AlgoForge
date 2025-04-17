import { Link } from "react-router-dom";
import { User } from "../App";

interface NavbarProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Navbar = ({
  isLoggedIn,
  currentUser,
  onLoginClick,
  onLogout,
}: NavbarProps) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          &lt;<span style={{ color: "#736efa" }}>/</span>&gt; Algo
          <span style={{ color: "#736efa" }}>Rush</span>
        </Link>
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
              <Link className="nav-link" to="/problems">
                Problems
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/browse">
                Browse
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/forums">
                Forums
              </Link>
            </li>
            {isLoggedIn && currentUser?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  <span className="badge bg-danger me-1">Admin</span>
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex">
            {isLoggedIn && currentUser ? (
              <div className="dropdown">
                <button
                  className="btn btn-dark dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {currentUser.username}
                  <span className="ms-2 badge bg-primary">
                    {currentUser.problemsSolved}/{currentUser.totalProblems}
                  </span>
                  {currentUser.role === "admin" && (
                    <span className="ms-1 badge bg-danger">Admin</span>
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
