import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import ProblemUploadForm from "../../components/UploadForm";

interface PublishProblemProps {
  currentUser: User | null;
}

const PublishProblem = ({ currentUser }: PublishProblemProps) => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="publish-container text-center text-light p-5">
        <div className="card bg-dark text-light border-secondary">
          <div className="card-body">
            <i className="bi bi-exclamation-circle text-warning fs-1 mb-3"></i>
            <h3>Login Required</h3>
            <p className="text-muted">Please log in to publish problems.</p>
            <a href="/login" className="btn btn-primary">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleUploadSuccess = (requestId: string) => {
    setShowSuccessMessage(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="publish-container">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-2">
                    <i className="bi bi-upload me-2 text-primary"></i>
                    Publish a Problem
                  </h2>
                  <p className="text-muted mb-0">
                    Share your algorithmic challenges with the AlgoRush community. 
                    All submissions are reviewed by admins before being published.
                  </p>
                </div>
                <div className="text-end">
                  <button 
                    className="btn btn-outline-info me-2"
                    onClick={() => navigate("/my-problems")}
                  >
                    <i className="bi bi-list-ul me-1"></i>
                    My Submissions
                  </button>
                  <div className="mt-2">
                    <small className="text-muted">
                      Submitting as: <span className="text-info">{currentUser.username}</span>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              <strong>Success!</strong> Your problem has been submitted for review. 
              You'll be notified once an admin reviews your submission.
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowSuccessMessage(false)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-dark text-light border-info">
            <div className="card-header bg-info text-dark">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Submission Guidelines
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-info">✅ What makes a good problem:</h6>
                  <ul className="text-muted small">
                    <li>Clear, unambiguous problem statement</li>
                    <li>Well-defined input/output format</li>
                    <li>Comprehensive examples with explanations</li>
                    <li>Reasonable constraints and time limits</li>
                    <li>Complete working solution provided</li>
                    <li>Proper test cases (both visible and hidden)</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-warning">⚠️ Review process:</h6>
                  <ul className="text-muted small">
                    <li>Admin review typically takes 1-3 business days</li>
                    <li>Problems may be rejected if unclear or incorrect</li>
                    <li>You can edit pending submissions</li>
                    <li>Approved problems become public immediately</li>
                    <li>You'll receive credit as the problem author</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="row">
        <div className="col-12">
          <ProblemUploadForm onSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default PublishProblem;
