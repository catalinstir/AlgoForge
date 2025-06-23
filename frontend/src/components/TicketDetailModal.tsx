import React from "react";

interface TicketDetailModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string) => void;
}

const TicketDetailModal = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: TicketDetailModalProps) => {
  if (!isOpen || !ticket) return null;

  const getDifficultyColorClass = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy":
        return "text-success";
      case "Medium":
        return "text-warning";
      case "Hard":
        return "text-danger";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content bg-dark text-light border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="bi bi-ticket-detailed me-2"></i>
              Problem Submission Details
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-8">
                {/* Problem Details */}
                <div className="card bg-dark border-secondary mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Problem Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Title:</strong> {ticket.title}
                    </div>
                    <div className="mb-3">
                      <strong>Difficulty:</strong> 
                      <span className={`ms-2 ${getDifficultyColorClass(ticket.difficulty)}`}>
                        {ticket.difficulty}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Categories:</strong>
                      <div className="mt-1">
                        {ticket.categories?.map((cat: string, idx: number) => (
                          <span key={idx} className="badge bg-info me-1">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Description:</strong>
                      <div className="mt-2 p-3 bg-secondary rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {ticket.description}
                      </div>
                    </div>
                    {ticket.inputFormat && (
                      <div className="mb-3">
                        <strong>Input Format:</strong>
                        <div className="mt-2 p-3 bg-secondary rounded" style={{ whiteSpace: 'pre-wrap' }}>
                          {ticket.outputFormat}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Examples */}
                <div className="card bg-dark border-secondary mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Examples</h6>
                  </div>
                  <div className="card-body">
                    {ticket.examples?.map((example: any, idx: number) => (
                      <div key={idx} className="mb-3">
                        <strong>Example {idx + 1}:</strong>
                        <div className="mt-2">
                          <div className="mb-2">
                            <strong>Input:</strong>
                            <pre className="bg-secondary p-2 rounded mt-1">{example.input}</pre>
                          </div>
                          <div className="mb-2">
                            <strong>Output:</strong>
                            <pre className="bg-secondary p-2 rounded mt-1">{example.output}</pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <strong>Explanation:</strong> {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution Code */}
                <div className="card bg-dark border-secondary">
                  <div className="card-header">
                    <h6 className="mb-0">
                      Solution Code ({ticket.solutionCode?.language?.toUpperCase() || "Unknown"})
                    </h6>
                  </div>
                  <div className="card-body">
                    <pre className="bg-secondary p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                      <code>{ticket.solutionCode?.code || "No solution code provided"}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                {/* Submission Info */}
                <div className="card bg-dark border-secondary mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Submission Info</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Submitter:</strong> {ticket.submitter?.username || "Unknown"}
                    </div>
                    <div className="mb-3">
                      <strong>Email:</strong> {ticket.submitter?.email || "Unknown"}
                    </div>
                    <div className="mb-3">
                      <strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                    {ticket.reviewedAt && (
                      <div className="mb-3">
                        <strong>Reviewed:</strong> {new Date(ticket.reviewedAt).toLocaleString()}
                      </div>
                    )}
                    {ticket.feedback && (
                      <div className="mb-3">
                        <strong>Feedback:</strong>
                        <div className="mt-2 p-2 bg-secondary rounded">
                          {ticket.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Constraints */}
                {ticket.constraints && ticket.constraints.length > 0 && (
                  <div className="card bg-dark border-secondary mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Constraints</h6>
                    </div>
                    <div className="card-body">
                      <ul className="list-unstyled">
                        {ticket.constraints.map((constraint: string, idx: number) => (
                          <li key={idx} className="mb-1">
                            <code>{constraint}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Test Cases Count */}
                {ticket.testCases && (
                  <div className="card bg-dark border-secondary mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Test Cases</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">
                        <strong>Total:</strong> {ticket.testCases.length}
                      </div>
                      <div className="mb-2">
                        <strong>Hidden:</strong> {ticket.testCases.filter((tc: any) => tc.isHidden).length}
                      </div>
                      <div>
                        <strong>Visible:</strong> {ticket.testCases.filter((tc: any) => !tc.isHidden).length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Includes */}
                {ticket.suggestedIncludes && Object.keys(ticket.suggestedIncludes).length > 0 && (
                  <div className="card bg-dark border-secondary">
                    <div className="card-header">
                      <h6 className="mb-0">Suggested Includes</h6>
                    </div>
                    <div className="card-body">
                      {Object.entries(ticket.suggestedIncludes).map(([lang, includes]: [string, any]) => (
                        includes && includes.length > 0 && (
                          <div key={lang} className="mb-3">
                            <strong className="text-info">{lang.toUpperCase()}:</strong>
                            <div className="mt-1">
                              {includes.map((include: string, idx: number) => (
                                <div key={idx} className="text-muted small">
                                  <code>{include}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {ticket.status === "Pending" && (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onReject(ticket._id)}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => onApprove(ticket._id)}
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Approve
                </button>
              </>
            )}
            {ticket.status === "Approved" && ticket.approvedProblem && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.open(`/problem/${ticket.approvedProblem._id}`, '_blank')}
              >
                <i className="bi bi-arrow-right me-1"></i>
                View Published Problem
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
