import React from "react";

interface ConfirmAccountProps {
  handleConfirmationSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ConfirmAccount = ({ handleConfirmationSubmit }: ConfirmAccountProps ) => {
  return (
    <>
      <form onSubmit={handleConfirmationSubmit} className="signup-form">
        <div className="signup-form-group flex flex-col gap-1">
          <label htmlFor="confirmationCode">Confirmation Code</label>
          <input
            type="text"
            id="confirmationCode"
            name="confirmationCode"
            placeholder="Enter confirmation code"
            required
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
