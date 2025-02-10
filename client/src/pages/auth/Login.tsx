import "./login.css";
import google_logo from "../../assets/google.png";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { login, logout } from "../../services/auth/auth-service";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import CheckModal from "../../components/modals/spinner/CheckModal";
import {
  getToken,
} from "../../services/auth/token-service";

const Login = () => {
  const getUrl = (params: string) => {
    const url = window.location.href;

    if (url.split("/").includes(params)) {
      return true;
    }

    return false;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const error = urlParams.get('error');
  
    if (accessToken) {
      setIsLoading(true);
  
      setTimeout(() => {
        setIsLoading(false);
        navigate('/chat');
      }, 2000);
    } else if (error) {
      setErrorMessage("This email already registered with normal way of login");
    }
  }, [navigate]);
  
  const handleGoogleLogin = () => {
    window.location.replace(
      `${process.env.GOOGLE_CLIENT_REDIRECT_URL}`
    );
  }

  const [formData, setFormdata] = useState({
    username_or_email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setTimeout(async () => {
      if (await getToken()) {
        await logout();
      }

      const response = await login(formData);

      if (response.success) {
        setSuccessMessage("Login successfull!");
        setTimeout(() => {
          window.location.replace("/");
        }, 1500);
      } else {
        setIsLoading(false);
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error ??
              response.message ??
              response.error ??
              "Invalid username or password"
          );
        }
      }
    }, 1000);
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {isLoading && <CheckModal message={"Checking..."} />}

      <main id="auth-main">
        <section id="login">
          <div className="logo">
            <h1 className="">
              Welcome to <p className="text-[#00ff00]">Connectify</p>
            </h1>
          </div>
          <div className="auth-buttons">
            <Link to="/auth/login" className={getUrl("login") ? "active" : ""}>
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className={getUrl("signup") ? "active" : ""}
            >
              Sign up
            </Link>
          </div>

          <div className="google-btn" onClick={handleGoogleLogin}>
            <div className="google-icon-wrapper">
              <img
                className="google-icon"
                src={google_logo}
                alt="google button"
                width={30}
              />
            </div>
            <p className="btn-text">
              <b>Sign in with google</b>
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" className="login-form">
            <div className="login-form-group">
              <label htmlFor="username_or_email">Username or Email</label>
              <input
                type="text"
                id="username_or_email"
                name="username_or_email"
                placeholder="Enter your username or email"
                required
                onChange={handleChange}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                onChange={handleChange}
              />
            </div>

            <div className="login-form-group">
              <button type="submit">Log in</button>
            </div>

            <p className="text-center">
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="font-serif underline hover:text-[#00ff00] transition duration-300"
              >
                Sign up
              </Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
};

export default Login;
