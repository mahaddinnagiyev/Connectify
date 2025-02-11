import "./forgot-password.css";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
        console.log(error);
        setErrorMessage("Something went wrong. Please try again.");
        navigate("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

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
      console.log(error);
      setErrorMessage("Something went wrong. Please try again.");
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
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your new password"
                  required
                  onChange={handleChange}
                />
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
