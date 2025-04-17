import { useState } from "react";
import { User } from "../../App";

interface AdminDashboardProps {
  currentUser: User | null;
}

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("problems");

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="alert alert-danger">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="problems-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-light">Admin Dashboard</h2>
          <span className="badge bg-danger fs-6">Admin Access</span>
        </div>

        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${
                selectedTab === "problems" ? "active" : ""
              }`}
              onClick={() => setSelectedTab("problems")}
            >
              Problems
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${selectedTab === "users" ? "active" : ""}`}
              onClick={() => setSelectedTab("users")}
            >
              Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                selectedTab === "submissions" ? "active" : ""
              }`}
              onClick={() => setSelectedTab("submissions")}
            >
              Submissions
            </button>
          </li>
        </ul>

        <div className="tab-content mt-4">
          {selectedTab === "problems" && (
            <div className="tab-pane active">
              <div className="d-flex justify-content-between mb-3">
                <h4 className="text-light">Manage Problems</h4>
                <button className="btn btn-success btn-sm">
                  <i className="bi bi-plus-circle"></i> Add New Problem
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Title</th>
                      <th scope="col">Difficulty</th>
                      <th scope="col">Acceptance</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Two Sum</td>
                      <td>
                        <span className="text-success">Easy</span>
                      </td>
                      <td>47.5%</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Add Two Numbers</td>
                      <td>
                        <span className="text-warning">Medium</span>
                      </td>
                      <td>38.2%</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === "users" && (
            <div className="tab-pane active">
              <h4 className="text-light mb-3">Manage Users</h4>
              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Username</th>
                      <th scope="col">Role</th>
                      <th scope="col">Problems Solved</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>admin</td>
                      <td>
                        <span className="badge bg-danger">Admin</span>
                      </td>
                      <td>10/10</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">Ban</button>
                      </td>
                    </tr>
                    <tr>
                      <td>user123</td>
                      <td>
                        <span className="badge bg-info">User</span>
                      </td>
                      <td>5/10</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">Ban</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === "submissions" && (
            <div className="tab-pane active">
              <h4 className="text-light mb-3">Recent Submissions</h4>
              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">User</th>
                      <th scope="col">Problem</th>
                      <th scope="col">Status</th>
                      <th scope="col">Date</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1001</td>
                      <td>user123</td>
                      <td>Two Sum</td>
                      <td>
                        <span className="badge bg-success">Accepted</span>
                      </td>
                      <td>2025-04-17</td>
                      <td>
                        <button className="btn btn-sm btn-info">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>1002</td>
                      <td>newbie_dev</td>
                      <td>Add Two Numbers</td>
                      <td>
                        <span className="badge bg-danger">Failed</span>
                      </td>
                      <td>2025-04-16</td>
                      <td>
                        <button className="btn btn-sm btn-info">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
