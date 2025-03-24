import { useState, useEffect } from "react";
import "./css/forgot-password.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  isResetTokenValid,
  resetPassword,
} from "../../services/auth/auth-service";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import CheckModal from "../../components/modals/spinner/CheckModal";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth/login");
      return;
    }

    const validateToken = async () => {
      setIsLoading(true);
      try {
        const response = await isResetTokenValid(token);
        if (!response.success) {
          localStorage.setItem("errorMessage", "Invalid Token");
          navigate("/auth/login");
        }
      } catch (error) {
        if (error) {
          setErrorMessage("Something went wrong. Please try again.");
          navigate("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await resetPassword(password, token);
      if (response.success) {
        localStorage.setItem("successMessage", "Password reset successfully.");
        navigate("/auth/login");
      } else {
        setErrorMessage(response.message || "Failed to reset password.");
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
      {isLoading && <CheckModal message={"Processing..."} />}

      <main id="auth-main">
        <section id="forgot-password">
          <div className="forgot-password-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="forgot-password-group">
                <label htmlFor="password">Password</label>
                <input
                  autoComplete="off"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your new password"
                  required
                  onChange={handleChange}
                />
                <span
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-10 cursor-pointer"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              <div className="forgot-password-group">
                <button type="submit">Reset Password</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default ResetPassword;
