import React, { useState } from "react";
import { Link } from "react-router-dom";
import FaceIDModal from "../../modals/auth/FaceIDModal";

const FaceIDForm = () => {
  const [formData, setFormData] = useState({
    username_or_email_face_id: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username_or_email_face_id) {
      setErrorMessage("Please enter your username or email.");
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowModal(false);
  };

  return (
    <>
      <form method="POST" className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-group">
          <label htmlFor="username_or_email_face_id">Username or Email</label>
          <input
            autoComplete="off"
            type="text"
            id="username_or_email_face_id"
            name="username_or_email_face_id"
            placeholder="Enter your username or email"
            required
            onChange={handleChange}
          />
        </div>

        <div className="login-form-group">
          <button type="submit">Log in with Face ID</button>
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
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </form>

      {showModal && (
        <FaceIDModal
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          mode="login"
          username_or_email_face_id={formData.username_or_email_face_id}
        />
      )}
    </>
  );
};

export default FaceIDForm;
