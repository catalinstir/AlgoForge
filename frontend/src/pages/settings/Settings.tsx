import React, { useState } from "react";
import { User } from "../../types";
import { authAPI, userAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
}

const Settings = ({ user, onLogout }: SettingsProps) => {
  const navigate = useNavigate();
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Account deletion form state
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmationText: "",
  });
  
  // Loading and error states
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Modal state for account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="settings-container text-center text-light p-5">
        <div className="card bg-dark text-light border-secondary">
          <div className="card-body">
            <i className="bi bi-exclamation-circle text-warning fs-1 mb-3"></i>
            <h3>Access Denied</h3>
            <p className="text-muted">Please log in to access settings.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: "", score: 0 };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return { strength: "weak", score };
    if (score < 5) return { strength: "medium", score };
    return { strength: "strong", score };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError(null);
    if (passwordSuccess) setPasswordSuccess(null);
  };

  const handleDeleteFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({ ...prev, [name]: value }));
    if (deleteError) setDeleteError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(
        err.response?.data?.error || "Failed to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    // Validation
    if (!deleteForm.password) {
      setDeleteError("Password is required to delete your account.");
      return;
    }

    if (deleteForm.confirmationText !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setDeleteLoading(true);

    try {
      await userAPI.deleteAccount({
        password: deleteForm.password,
      });

      // Account deleted successfully
      alert("Your account has been deleted successfully. You will be logged out.");
      onLogout();
      navigate("/login");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setDeleteError(
        err.response?.data?.error || "Failed to delete account. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteForm({ password: "", confirmationText: "" });
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteForm({ password: "", confirmationText: "" });
    setDeleteError(null);
  };

  return (
    <div className="settings-container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Settings
              </h2>
            </div>

            <div className="card-body p-4">
              {/* Account Information Section */}
              <div className="settings-section mb-5">
                <h4 className="mb-3 text-info">
                  <i className="bi bi-person-circle me-2"></i>
                  Account Information
                </h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card bg-dark border-secondary h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-person me-1"></i>
                          Username
                        </h6>
                        <p className="card-text text-muted fs-5 mb-0">{user.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-secondary h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-envelope me-1"></i>
                          Email
                        </h6>
                        <p className="card-text text-muted fs-5 mb-0">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-secondary h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-shield-check me-1"></i>
                          Role
                        </h6>
                        <p className="card-text mb-0">
                          <span className={`badge fs-6 ${
                            user.role === 'admin' ? 'bg-danger' : 
                            user.role === 'user' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-secondary h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-trophy me-1"></i>
                          Problems Solved
                        </h6>
                        <p className="card-text fs-5 mb-0 text-success">
                          {user.problemsSolvedCount || 0}
                          <small className="text-muted ms-2">
                            / {user.totalProblems || 0}
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-secondary" />

              {/* Change Password Section */}
              <div className="settings-section mb-5">
                <h4 className="mb-3 text-info">
                  <i className="bi bi-shield-lock me-2"></i>
                  Change Password
                </h4>
                <p className="text-muted mb-4">
                  Update your password to keep your account secure. Use a strong password with at least 6 characters.
                </p>

                {passwordSuccess && (
                  <div className="alert alert-success mb-3" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="alert alert-danger mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        className="form-control bg-dark text-light border-secondary"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={passwordLoading}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password *
                      </label>
                      <input
                        type="password"
                        className="form-control bg-dark text-light border-secondary"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={passwordLoading}
                        placeholder="Enter your new password"
                        minLength={6}
                        autoComplete="new-password"
                      />
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className={`password-strength ${passwordStrength.strength}`}></div>
                          <small className={`text-${
                            passwordStrength.strength === 'weak' ? 'danger' : 
                            passwordStrength.strength === 'medium' ? 'warning' : 'success'
                          } mt-1 d-block`}>
                            Password strength: {passwordStrength.strength || 'None'}
                          </small>
                        </div>
                      )}
                      <small className="text-muted">
                        Minimum 6 characters. Include uppercase, lowercase, numbers, and symbols for better security.
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        className="form-control bg-dark text-light border-secondary"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={passwordLoading}
                        placeholder="Confirm your new password"
                        minLength={6}
                        autoComplete="new-password"
                      />
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <small className="text-danger mt-1 d-block">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Passwords do not match
                        </small>
                      )}
                      {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length >= 6 && (
                        <small className="text-success mt-1 d-block">
                          <i className="bi bi-check-circle me-1"></i>
                          Passwords match
                        </small>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      passwordLoading || 
                      !passwordForm.currentPassword || 
                      !passwordForm.newPassword || 
                      !passwordForm.confirmPassword || 
                      passwordForm.newPassword !== passwordForm.confirmPassword ||
                      passwordForm.newPassword.length < 6
                    }
                  >
                    {passwordLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              <hr className="border-secondary" />

              {/* Danger Zone Section */}
              <div className="settings-section">
                <h4 className="mb-3 text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Danger Zone
                </h4>
                <p className="text-muted mb-4">
                  Irreversible and destructive actions. Please proceed with caution.
                </p>

                <div className="card bg-danger bg-opacity-10 border-danger">
                  <div className="card-body">
                    <h5 className="card-title text-danger">
                      <i className="bi bi-trash me-2"></i>
                      Delete Account
                    </h5>
                    <p className="card-text text-muted mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <div className="alert alert-warning mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <strong>Warning:</strong> This will permanently delete:
                    </div>
                    <ul className="text-muted small mb-3">
                      <li>All your submissions and progress ({user.problemsAttemptedCount || 0} attempts)</li>
                      <li>Your profile and user statistics</li>
                      <li>Any problems you've uploaded ({user.problemsUploadedCount || 0} problems)</li>
                      <li>Your forum posts and activity</li>
                      <li>This action is irreversible and cannot be recovered</li>
                    </ul>
                    {user.role === 'admin' && (
                      <div className="alert alert-info mb-3" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Admin Note:</strong> Your uploaded problems will be transferred to another admin before deletion.
                        {user.problemsUploadedCount && user.problemsUploadedCount > 0 && (
                          <span> You have {user.problemsUploadedCount} problems that will be transferred.</span>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={openDeleteModal}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-light border-danger">
              <div className="modal-header border-danger">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Delete Account - Final Confirmation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>⚠️ Final Warning!</strong> This action is permanent and cannot be undone.
                </div>

                <div className="card bg-dark border-warning mb-3">
                  <div className="card-body">
                    <h6 className="card-title text-warning">
                      <i className="bi bi-person-circle me-2"></i>
                      Account to be deleted:
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1 text-muted"><strong>Username:</strong> {user.username}</p>
                        <p className="mb-1 text-muted"><strong>Email:</strong> {user.email}</p>
                        <p className="mb-0 text-muted"><strong>Role:</strong> {user.role}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted"><strong>Problems Solved:</strong> {user.problemsSolvedCount || 0}</p>
                        <p className="mb-1 text-muted"><strong>Problems Attempted:</strong> {user.problemsAttemptedCount || 0}</p>
                        <p className="mb-0 text-muted"><strong>Problems Uploaded:</strong> {user.problemsUploadedCount || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mb-3">
                  You are about to permanently delete your account. This will:
                </p>
                <ul className="mb-4">
                  <li>Delete all your submissions and progress</li>
                  <li>Remove your profile and account data</li>
                  <li>Transfer your uploaded problems to admins (if any)</li>
                  <li>Remove you from all leaderboards and statistics</li>
                  <li>Log you out immediately</li>
                  <li><strong>Cannot be recovered or restored</strong></li>
                </ul>

                {deleteError && (
                  <div className="alert alert-danger mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {deleteError}
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="deletePassword" className="form-label">
                      <i className="bi bi-shield-lock me-1"></i>
                      Enter your password to confirm *
                    </label>
                    <input
                      type="password"
                      className="form-control bg-dark text-light border-secondary"
                      id="deletePassword"
                      name="password"
                      value={deleteForm.password}
                      onChange={handleDeleteFormChange}
                      required
                      disabled={deleteLoading}
                      placeholder="Your account password"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmationText" className="form-label">
                      <i className="bi bi-type me-1"></i>
                      Type "DELETE" to confirm *
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      id="confirmationText"
                      name="confirmationText"
                      value={deleteForm.confirmationText}
                      onChange={handleDeleteFormChange}
                      required
                      disabled={deleteLoading}
                      placeholder="Type DELETE here"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <small className="text-muted">This confirms you understand the consequences</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-danger">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteLoading || 
                    !deleteForm.password || 
                    deleteForm.confirmationText.toUpperCase() !== "DELETE"
                  }
                >
                  {deleteLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      Delete Account Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
