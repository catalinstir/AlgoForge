const Forums = () => {
  return (
    <div className="forums-container">
      <div className="problems-container">
        <h2 className="text-light">Discussion Forums</h2>
        <div className="mt-4">
          <div className="list-group">
            <a
              href="#"
              className="list-group-item list-group-item-action bg-dark text-light"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">Two Sum efficient solution</h5>
                <small className="text-muted">3 days ago</small>
              </div>
              <p className="mb-1">
                I found a really efficient O(n) solution using hash maps...
              </p>
              <small className="text-muted">By: coder123</small>
            </a>
            <a
              href="#"
              className="list-group-item list-group-item-action bg-dark text-light"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">
                  Struggling with Regular Expression Matching
                </h5>
                <small className="text-muted">1 week ago</small>
              </div>
              <p className="mb-1">
                Could someone explain the DP approach for this problem?
              </p>
              <small className="text-muted">By: newbie_dev</small>
            </a>
            <a
              href="#"
              className="list-group-item list-group-item-action bg-dark text-light"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">Time complexity of Zigzag Conversion</h5>
                <small className="text-muted">2 weeks ago</small>
              </div>
              <p className="mb-1">
                I'm trying to understand the time complexity analysis...
              </p>
              <small className="text-muted">By: algorithm_master</small>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forums;
