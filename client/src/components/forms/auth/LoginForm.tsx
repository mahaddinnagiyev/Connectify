import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../../services/auth/auth-service";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface LoginFormProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const LoginForm = ({
  setIsLoading,
  setSuccessMessage,
  setErrorMessage,
}: LoginFormProps) => {
  const [formData, setFormdata] = useState({
    username_or_email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const from = location.state?.from?.pathname || "/messenger";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await login(formData);

      if (response.success) {
        setSuccessMessage("Login successfull!");
        navigate(from, { replace: true });
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
    } catch (error) {
      if (error) {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} method="POST" className="login-form">
        <div className="login-form-group">
          <label htmlFor="username_or_email">Username or Email</label>
          <input
            autoComplete="off"
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
    </>
  );
};

export default LoginForm;
