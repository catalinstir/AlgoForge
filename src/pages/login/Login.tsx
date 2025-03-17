import { useState } from "react";
import "../../styles/App.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Logging in with:", { username, password });
    } else {
      if (password === confirmPassword) {
        console.log("Signing up with:", { username, password });
      } else {
        alert("Passwords do not match");
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Re-type Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="btn btn-link p-0" onClick={toggleMode}>
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
