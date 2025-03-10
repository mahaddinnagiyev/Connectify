import "./css/forgot-password.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import CheckModal from "../../components/modals/spinner/CheckModal";
import { forgot_password } from "../../services/auth/auth-service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgot_password(email);
      if (response.success) {
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(
          response.response.error ||
            response.message ||
            "An error occurred. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("An error occurred while processing your request.");
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
            <h2>Forgot Password</h2>
            <p>
              Please enter your email address to receive a password reset link.
            </p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="forgot-password-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="forgot-password-group">
                <button type="submit">Send Reset Link</button>
              </div>
            </form>
            <div className="forgot-password-back">
              Remembered your password?{" "}
              <Link
                to="/auth/login"
                className="underline hover:text-[#00ff00] transition duration-300"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ForgotPassword;
