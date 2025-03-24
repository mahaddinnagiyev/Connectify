import "./css/login.css";
import google_logo from "../../assets/google.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { login } from "../../services/auth/auth-service";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import CheckModal from "../../components/modals/spinner/CheckModal";

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
    const accessToken = urlParams.get("access_token");
    const error = urlParams.get("error");

    if (accessToken) {
      setIsLoading(true);
      localStorage.setItem("successMessage", "Login successfull!");
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/messenger";
      }, 2000);
    } else if (error) {
      setErrorMessage("This email already registered with normal way of login");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.replace(`${process.env.GOOGLE_CLIENT_REDIRECT_URL}`);
  };

  const [formData, setFormdata] = useState({
    username_or_email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setTimeout(async () => {
      const response = await login(formData);

      if (response.success) {
        setSuccessMessage("Login successfull!");
        setTimeout(() => {
          window.location.href = "/messenger";
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

  useEffect(() => {
    const message = localStorage.getItem("successMessage");
    const errorMessage = localStorage.getItem("errorMessage");

    if (errorMessage) {
      setErrorMessage(errorMessage);
      localStorage.removeItem("errorMessage");
    } else if (message) {
      setSuccessMessage(message);
      localStorage.removeItem("successMessage");
    }
  }, []);

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

            <div className="login-form-group relative">
              <label htmlFor="password">Password</label>
              <input
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                onChange={handleChange}
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-10 cursor-pointer"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
              <p className="text-start pt-2 text-xs">
                Forgot password?{" "}
                <Link
                  to="/auth/forgot-password"
                  className="font-serif underline hover:text-[#00ff00] transition duration-300"
                >
                  Click here
                </Link>
              </p>
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
