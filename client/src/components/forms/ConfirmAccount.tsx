import React, { useState } from "react";
import { confirm_account } from "../../services/auth/auth-service";
import SuccessMessage from "../messages/SuccessMessage";
import ErrorMessage from "../messages/ErrorMessage";
// import { useNavigate } from "react-router-dom";

const ConfirmAccount = () => {
  const [formData, setFormData] = useState({ code: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) }); // Convert to number
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const response = await confirm_account(formData);

    if (response.success) {
      window.location.replace("/auth/login");
      setSuccessMessage("Account confirmed successfully!");
    } else {
      if (Array.isArray(response.message)) {
        setErrorMessage(response.message[0]);
      } else {
        setErrorMessage(
          response.response?.error ??
            response.message ??
            response.error ??
            "Invalid confirmation code"
        );
      }
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

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-form-group flex flex-col gap-1">
          <label htmlFor="confirmationCode">Confirmation Code</label>
          <input
            autoComplete="off"
            type="number"
            id="confirmationCode"
            name="code"
            placeholder="Enter confirmation code"
            required
            onChange={handleChange}
            min={100000}
            max={999999}
          />
        </div>

        <div className="signup-form-group">
          <button type="submit">Confirm</button>
        </div>
      </form>
    </>
  );
};

export default ConfirmAccount;
