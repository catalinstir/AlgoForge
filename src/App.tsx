import { useState } from "react";
import Login from "./pages/login/Login";
import Navbar from "./components/Navbar";
import ProblemList from "./components/ProblemList";

const App = () => {
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleLoginClick = () => {
    setShowLoginPage(true);
  };

  const handleLoginSuccess = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setShowLoginPage(false);
  };

  return (
    <div className="app-container">
      {showLoginPage && <div className="sliding-background"></div>}

      <div className="content-container">
        <Navbar
          isLoggedIn={isLoggedIn}
          username={username}
          onLoginClick={handleLoginClick}
        />

        {showLoginPage ? (
          <div className="container d-flex justify-content-center align-items-center login-page-container">
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="container main-content p-4">
            <ProblemList />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
