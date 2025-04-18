import React from "react";
import { Link } from "react-router-dom"; // Use Link for navigation

const Forums = () => {
  // Mock forum threads (replace with dynamic data later)
  const threads = [
    {
      id: 1,
      title: "Two Sum efficient solution in O(n)",
      author: "coder123",
      time: "3 days ago",
      snippet: "I found a really efficient O(n) solution using hash maps...",
      replies: 15,
      problemId: 1,
    },
    {
      id: 2,
      title: "Struggling with Regular Expression Matching DP",
      author: "newbie_dev",
      time: "1 week ago",
      snippet:
        "Could someone explain the DP state transitions for this problem?",
      replies: 8,
      problemId: 10,
    },
    {
      id: 3,
      title: "Time complexity of Zigzag Conversion?",
      author: "algo_master",
      time: "2 weeks ago",
      snippet:
        "I'm trying to understand the time complexity analysis, is it O(n)?",
      replies: 5,
      problemId: 6,
    },
    {
      id: 4,
      title: "Java solution for Add Two Numbers",
      author: "java_guru",
      time: "1 month ago",
      snippet: "Here's my approach using carry and dummy head node...",
      replies: 22,
      problemId: 2,
    },
  ];

  return (
    <div className="forums-container">
      {/* Use the same container style */}
      <div className="problems-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-light mb-0">Discussion Forums</h2>
          <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-1"></i> New Thread
          </button>
        </div>

        {/* List of forum threads */}
        <div className="list-group">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              // Link to a specific thread page (e.g., /forums/thread/1)
              to={`/forums/thread/${thread.id}`}
              className="list-group-item list-group-item-action bg-dark text-light border-secondary mb-2 rounded" // Added margin and rounded corners
            >
              <div className="d-flex w-100 justify-content-between mb-1">
                <h5 className="mb-1 text-primary">{thread.title}</h5>
                <small className="text-muted">{thread.time}</small>
              </div>
              <p className="mb-1 text-light">{thread.snippet}</p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">By: {thread.author}</small>
                <span className="badge bg-secondary rounded-pill">
                  {thread.replies} replies
                </span>
              </div>
              {/* Link to the related problem */}
              {thread.problemId && (
                <small className="d-block mt-1">
                  Related Problem:{" "}
                  <Link
                    to={`/problem/${thread.problemId}`}
                    className="text-info"
                  >
                    #{thread.problemId}
                  </Link>
                </small>
              )}
            </Link>
          ))}
        </div>

        {/* Placeholder for Pagination */}
        <nav
          aria-label="Forum pagination"
          className="mt-4 d-flex justify-content-center"
        >
          <ul className="pagination pagination-sm">
            <li className="page-item disabled">
              <a className="page-link bg-dark text-muted" href="#">
                Previous
              </a>
            </li>
            <li className="page-item active" aria-current="page">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item">
              <a className="page-link bg-dark text-primary" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link bg-dark text-primary" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link bg-dark text-primary" href="#">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Forums;
