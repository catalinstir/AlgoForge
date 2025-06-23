import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { userAPI } from "../../services/api";
import UserSubmissions from "../../components/UserSubmissions"; // NEW IMPORT

interface ProfileProps {
  user: User | null;
}

interface UserStats {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    problemsSolvedCount: number;
    problemsAttemptedCount: number;
    problemsUploadedCount: number;
    totalProblems: number;
    successRate: number;
    solvedByDifficulty: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    problemsByDifficulty: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    createdAt?: string;
  };
  recentActivity?: any[];
}

const Profile = ({ user }: ProfileProps) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      setUserStats({ user: response.data });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile information.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container text-center text-light p-5">
        Please log in to view your profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container text-center text-light p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
        <p className="mt-3">Loading profile information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            className="btn btn-outline-danger ms-3"
            onClick={fetchUserProfile}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage =
    userStats?.user?.totalProblems && userStats.user.totalProblems > 0
      ? (userStats.user.problemsSolvedCount / userStats.user.totalProblems) * 100
      : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="profile-container">
      <div className="card bg-dark text-light border-secondary">
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">User Profile</h2>
          <div>
            <span
              className={`badge fs-6 ${
                user.role === "admin"
                  ? "bg-danger"
                  : user.role === "guest"
                  ? "bg-secondary"
                  : "bg-info"
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Username and Join Date */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="card-title mb-1">{user.username}</h3>
              <p className="text-muted small">
                Member since:{" "}
                {userStats?.user?.createdAt
                  ? formatDate(userStats.user.createdAt)
                  : "N/A"}
              </p>
            </div>
            <div className="text-end">
              <div className="text-muted small">Success Rate</div>
              <div className="fs-4 text-primary">
                {userStats?.user?.successRate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "solved" ? "active" : ""}`}
                onClick={() => setActiveTab("solved")}
              >
                Solved Problems
              </button>
            </li>
            {/* NEW: Submissions Tab */}
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "submissions" ? "active" : ""}`}
                onClick={() => setActiveTab("submissions")}
              >
                My Submissions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "statistics" ? "active" : ""
                }`}
                onClick={() => setActiveTab("statistics")}
              >
                Statistics
              </button>
            </li>
            {user.role === "admin" && (
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "admin" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("admin")}
                >
                  Admin
                </button>
              </li>
            )}
          </ul>

          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="tab-pane fade show active">
                <h5 className="mb-3">Overall Progress</h5>
                <div className="progress mb-2" style={{ height: "25px" }}>
                  <div
                    className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${progressPercentage}%` }}
                    aria-valuenow={userStats?.user?.problemsSolvedCount || 0}
                    aria-valuemin={0}
                    aria-valuemax={userStats?.user?.totalProblems || 100}
                  >
                    {progressPercentage > 10
                      ? `${userStats?.user?.problemsSolvedCount || 0} / ${
                          userStats?.user?.totalProblems || 0
                        }`
                      : ""}
                  </div>
                </div>
                <p className="text-center text-muted small mb-4">
                  {progressPercentage <= 10
                    ? `${userStats?.user?.problemsSolvedCount || 0} / ${
                        userStats?.user?.totalProblems || 0
                      } Solved`
                    : "Problems Solved"}
                </p>

                <div className="mb-4">
                  <h5 className="mb-3">Problems by Difficulty</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-dark border-success text-light">
                        <div className="card-body">
                          <h6 className="card-title text-success">Easy</h6>
                          <div className="d-flex justify-content-between">
                            <span>Solved:</span>
                            <span>
                              {userStats?.user?.solvedByDifficulty?.Easy || 0}{" "}
                              /
                              {userStats?.user?.problemsByDifficulty?.Easy || 0}
                            </span>
                          </div>
                          <div className="progress mt-2" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{
                                width: `${
                                  userStats?.user?.problemsByDifficulty?.Easy 
                                    ? (userStats.user.solvedByDifficulty?.Easy || 0) / userStats.user.problemsByDifficulty.Easy * 100
                                    : 0
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-dark border-warning text-light">
                        <div className="card-body">
                          <h6 className="card-title text-warning">Medium</h6>
                          <div className="d-flex justify-content-between">
                            <span>Solved:</span>
                            <span>
                              {userStats?.user?.solvedByDifficulty?.Medium || 0}{" "}
                              /
                              {userStats?.user?.problemsByDifficulty?.Medium || 0}
                            </span>
                          </div>
                          <div className="progress mt-2" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-warning"
                              role="progressbar"
                              style={{
                                width: `${
                                  userStats?.user?.problemsByDifficulty?.Medium 
                                    ? (userStats.user.solvedByDifficulty?.Medium || 0) / userStats.user.problemsByDifficulty.Medium * 100
                                    : 0
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-dark border-danger text-light">
                        <div className="card-body">
                          <h6 className="card-title text-danger">Hard</h6>
                          <div className="d-flex justify-content-between">
                            <span>Solved:</span>
                            <span>
                              {userStats?.user?.solvedByDifficulty?.Hard || 0}{" "}
                              /
                              {userStats?.user?.problemsByDifficulty?.Hard || 0}
                            </span>
                          </div>
                          <div className="progress mt-2" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-danger"
                              role="progressbar"
                              style={{
                                width: `${
                                  userStats?.user?.problemsByDifficulty?.Hard 
                                    ? (userStats.user.solvedByDifficulty?.Hard || 0) / userStats.user.problemsByDifficulty.Hard * 100
                                    : 0
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card bg-dark border-info text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-info">Problems Attempted</h6>
                        <div className="fs-3 text-info">
                          {userStats?.user?.problemsAttemptedCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-warning text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-warning">Problems Uploaded</h6>
                        <div className="fs-3 text-warning">
                          {userStats?.user?.problemsUploadedCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="mb-3">Recent Activity</h5>
                  {userStats?.recentActivity &&
                  userStats.recentActivity.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {userStats.recentActivity.map((activity, index) => (
                        <li
                          key={index}
                          className="list-group-item bg-dark text-light border-secondary"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              {activity.status === "Accepted" ? (
                                <span className="text-success">Solved</span>
                              ) : (
                                <span className="text-warning">Attempted</span>
                              )}{" "}
                              "{activity.problem.title}"
                            </span>
                            <span className="text-muted small">
                              {new Date(
                                activity.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No recent activity found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "solved" && (
              <div className="tab-pane fade show active">
                <h5 className="mb-3">Solved Problems</h5>
                <p className="mb-3">
                  Total Solved:{" "}
                  <span className="badge bg-success">
                    {userStats?.user?.problemsSolvedCount || 0}
                  </span>
                </p>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card bg-dark border-success text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-success">Easy</h6>
                        <div className="fs-4 text-success">
                          {userStats?.user?.solvedByDifficulty?.Easy || 0}
                        </div>
                        <small className="text-muted">
                          of {userStats?.user?.problemsByDifficulty?.Easy || 0}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-dark border-warning text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-warning">Medium</h6>
                        <div className="fs-4 text-warning">
                          {userStats?.user?.solvedByDifficulty?.Medium || 0}
                        </div>
                        <small className="text-muted">
                          of {userStats?.user?.problemsByDifficulty?.Medium || 0}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-dark border-danger text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-danger">Hard</h6>
                        <div className="fs-4 text-danger">
                          {userStats?.user?.solvedByDifficulty?.Hard || 0}
                        </div>
                        <small className="text-muted">
                          of {userStats?.user?.problemsByDifficulty?.Hard || 0}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="tab-pane fade show active">
                <UserSubmissions user={user} />
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="tab-pane fade show active">
                <h5 className="mb-3">Submission Statistics</h5>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card bg-dark border-primary text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-primary">Success Rate</h6>
                        <div className="fs-3 text-primary">
                          {userStats?.user?.successRate?.toFixed(1) || 0}%
                        </div>
                        <small className="text-muted">
                          {userStats?.user?.problemsSolvedCount || 0} solved out of{" "}
                          {userStats?.user?.problemsAttemptedCount || 0} attempted
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-info text-light">
                      <div className="card-body text-center">
                        <h6 className="card-title text-info">Overall Progress</h6>
                        <div className="fs-3 text-info">
                          {progressPercentage.toFixed(1)}%
                        </div>
                        <small className="text-muted">
                          {userStats?.user?.problemsSolvedCount || 0} of{" "}
                          {userStats?.user?.totalProblems || 0} total problems
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admin" && user.role === "admin" && (
              <div className="tab-pane fade show active">
                <h5 className="mb-3">Admin Dashboard</h5>
                <div className="d-grid gap-3">
                  <a href="/admin" className="btn btn-outline-danger">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Go to Admin Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
