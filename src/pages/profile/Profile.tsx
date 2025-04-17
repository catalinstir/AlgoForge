import { User } from "../../App";

interface ProfileProps {
  user: User | null;
}

const Profile = ({ user }: ProfileProps) => {
  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="card bg-dark text-light">
        <div className="card-header">
          <h2>Profile</h2>
        </div>
        <div className="card-body">
          <h3>{user.username}</h3>
          <p>
            Role:{" "}
            <span
              className={user.role === "admin" ? "text-danger" : "text-info"}
            >
              {user.role}
            </span>
          </p>
          <div className="progress mb-3">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{
                width: `${(user.problemsSolved / user.totalProblems) * 100}%`,
              }}
              aria-valuenow={user.problemsSolved}
              aria-valuemin={0}
              aria-valuemax={user.totalProblems}
            >
              {user.problemsSolved}/{user.totalProblems}
            </div>
          </div>
          <p>
            Problems solved: {user.problemsSolved} out of {user.totalProblems}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
