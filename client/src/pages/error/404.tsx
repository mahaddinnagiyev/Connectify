import "./css/style.css";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <Helmet>
        <title>404 Not Found</title>
      </Helmet>
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you are looking for does not exist.
        </p>
        <div className="error-emoji">🔍</div>
        <button
          className="home-link"
          type="button"
          onClick={() => (window.location.href = "/")}
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
