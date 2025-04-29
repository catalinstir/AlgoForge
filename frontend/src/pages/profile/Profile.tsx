import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { userAPI } from "../../services/api";

interface ProfileProps {
  user: User | null;
}

interface UserStats {
  user: {
    totalProblems: number;
    problemsSolvedCount: number;
    problemsAttemptedCount: number;
  };
  statistics: {
    problems: {
      total: number;
      byDifficulty: { easy: number; medium: number; hard: number };
    };
    solved: {
      total: number;
      byDifficulty: { easy: number; medium: number; hard: number };
    };
    submissions: {
      total: number;
      successRate: number;
    };
  };
  recentActivity: any[];
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
      setUserStats(response.data);
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
    userStats?.statistics?.problems?.total &&
    userStats.statistics.problems.total > 0
      ? (userStats.statistics.solved.total /
          userStats.statistics.problems.total) *
        100
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
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "submissions" ? "active" : ""
                }`}
                onClick={() => setActiveTab("submissions")}
              >
                Submissions
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
                    aria-valuenow={userStats?.statistics?.solved?.total || 0}
                    aria-valuemin={0}
                    aria-valuemax={
                      userStats?.statistics?.problems?.total || 100
                    }
                  >
                    {progressPercentage > 10
                      ? `${userStats?.statistics?.solved?.total || 0} / ${
                          userStats?.statistics?.problems?.total || 0
                        }`
                      : ""}
                  </div>
                </div>
                <p className="text-center text-muted small mb-4">
                  {progressPercentage <= 10
                    ? `${userStats?.statistics?.solved?.total || 0} / ${
                        userStats?.statistics?.problems?.total || 0
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
                              {userStats?.statistics?.solved?.byDifficulty
                                ?.easy || 0}{" "}
                              /
                              {userStats?.statistics?.problems?.byDifficulty
                                ?.easy || 0}
                            </span>
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
                              {userStats?.statistics?.solved?.byDifficulty
                                ?.medium || 0}{" "}
                              /
                              {userStats?.statistics?.problems?.byDifficulty
                                ?.medium || 0}
                            </span>
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
                              {userStats?.statistics?.solved?.byDifficulty
                                ?.hard || 0}{" "}
                              /
                              {userStats?.statistics?.problems?.byDifficulty
                                ?.hard || 0}
                            </span>
                          </div>
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
                    {userStats?.statistics?.solved?.total || 0}
                  </span>
                </p>

                <div className="alert alert-info">
                  The solved problems list will be implemented in a future
                  update.
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="tab-pane fade show active">
                <h5 className="mb-3">Submission History</h5>
                <div className="d-flex justify-content-between mb-3">
                  <p>
                    Total Submissions:{" "}
                    <span className="badge bg-primary">
                      {userStats?.statistics?.submissions?.total || 0}
                    </span>
                  </p>
                  <p>
                    Success Rate:{" "}
                    <span className="badge bg-info">
                      {userStats?.statistics?.submissions?.successRate?.toFixed(
                        1
                      ) || 0}
                      %
                    </span>
                  </p>
                </div>

                <div className="alert alert-info">
                  The submissions history will be implemented in a future
                  update.
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
