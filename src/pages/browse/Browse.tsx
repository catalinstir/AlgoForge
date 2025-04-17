const Browse = () => {
  return (
    <div className="browse-container">
      <div className="problems-container">
        <h2 className="text-light">Browse Categories</h2>
        <div className="row mt-4">
          <div className="col-md-4 mb-3">
            <div className="card bg-dark text-light">
              <div className="card-body">
                <h5 className="card-title">Arrays</h5>
                <p className="card-text">
                  Problems related to array data structures.
                </p>
                <button className="btn btn-primary">View Problems</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-dark text-light">
              <div className="card-body">
                <h5 className="card-title">Linked Lists</h5>
                <p className="card-text">
                  Problems related to linked list data structures.
                </p>
                <button className="btn btn-primary">View Problems</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-dark text-light">
              <div className="card-body">
                <h5 className="card-title">Trees & Graphs</h5>
                <p className="card-text">
                  Problems related to tree and graph data structures.
                </p>
                <button className="btn btn-primary">View Problems</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
