import React from "react";
import { User } from "../../App"; // Import User type

interface ProfileProps {
  user: User | null;
}

const Profile = ({ user }: ProfileProps) => {
  // If no user data is available (e.g., not logged in), show a message or redirect
  if (!user) {
    return (
      <div className="profile-container text-center text-light p-5">
        Please log in to view your profile.
      </div>
    );
  }

  // Calculate progress percentage, handle division by zero
  const progressPercentage =
    user.totalProblems > 0
      ? (user.problemsSolved / user.totalProblems) * 100
      : 0;

  return (
    <div className="profile-container">
      <div className="card bg-dark text-light border-secondary">
        <div className="card-header bg-secondary text-white">
          <h2 className="mb-0">User Profile</h2>
        </div>
        <div className="card-body p-4">
          {/* Username and Role */}
          <h3 className="card-title mb-3">{user.username}</h3>
          <p className="mb-4">
            Role:{" "}
            <span
              // Apply different styling based on role
              className={`badge fs-6 ${
                user.role === "admin" ? "bg-danger" : "bg-info"
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
              {/* Capitalize role */}
            </span>
          </p>

          {/* Problem Solving Progress */}
          <h5 className="mb-3">Progress</h5>
          <div className="progress mb-2" style={{ height: "25px" }}>
            {" "}
            {/* Taller progress bar */}
            <div
              className="progress-bar bg-success progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={user.problemsSolved}
              aria-valuemin={0}
              aria-valuemax={user.totalProblems}
            >
              {/* Show text inside if there's enough space */}
              {progressPercentage > 10
                ? `${user.problemsSolved} / ${user.totalProblems}`
                : ""}
            </div>
          </div>
          {/* Show text outside if bar is too small */}
          {progressPercentage <= 10 && (
            <p className="text-center text-muted small mb-4">
              {user.problemsSolved} / {user.totalProblems} Solved
            </p>
          )}
          {progressPercentage > 10 && (
            <p className="text-center text-muted small mb-4">Problems Solved</p>
          )}

          {/* Placeholder for more profile details */}
          <div className="mt-4">
            <h5>Activity Feed (Placeholder)</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-dark text-light border-secondary">
                Solved "Two Sum" - 2 days ago
              </li>
              <li className="list-group-item bg-dark text-light border-secondary">
                Attempted "Add Two Numbers" - 1 day ago
              </li>
              <li className="list-group-item bg-dark text-light border-secondary">
                Joined AlgoRush - 1 week ago
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
