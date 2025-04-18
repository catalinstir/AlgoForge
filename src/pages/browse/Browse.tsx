import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Browse = () => {
  // Mock categories (replace with dynamic data later)
  const categories = [
    {
      name: "Arrays",
      description:
        "Problems involving array manipulation, searching, sorting, etc.",
      count: 5,
    },
    {
      name: "Strings",
      description:
        "Tasks related to string processing, pattern matching, and manipulation.",
      count: 4,
    },
    {
      name: "Linked Lists",
      description: "Challenges involving singly or doubly linked lists.",
      count: 2,
    },
    {
      name: "Trees & Graphs",
      description:
        "Problems on tree traversal, graph algorithms, and properties.",
      count: 3,
    },
    {
      name: "Dynamic Programming",
      description: "Optimize solutions using DP techniques.",
      count: 2,
    },
    {
      name: "Hashing",
      description: "Utilize hash tables for efficient lookups.",
      count: 1,
    },
  ];

  return (
    <div className="browse-container">
      {/* Use the same container style as ProblemList for consistency */}
      <div className="problems-container">
        <h2 className="text-light mb-4">Browse Categories</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {" "}
          {/* Responsive grid */}
          {categories.map((category, index) => (
            <div key={index} className="col">
              <div className="card h-100 bg-dark text-light border-secondary">
                {" "}
                {/* Ensure cards have same height */}
                <div className="card-body d-flex flex-column">
                  {" "}
                  {/* Flex column for button alignment */}
                  <h5 className="card-title text-primary">{category.name}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {category.description}
                  </p>{" "}
                  {/* Grow to push button down */}
                  {/* Link to a filtered problem list (adjust path as needed) */}
                  <Link
                    to={`/problems?category=${category.name.toLowerCase()}`}
                    className="btn btn-outline-primary mt-auto"
                  >
                    View Problems ({category.count})
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Browse;
