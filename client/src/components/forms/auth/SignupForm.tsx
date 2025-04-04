import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import google_logo from "../../../assets/google.png";

interface SignupFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    gender: string;
    password: string;
    confirm: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleResetPasswordVisibility = () => {
    setShowResetPassword((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    window.location.replace(`${process.env.GOOGLE_CLIENT_REDIRECT_URL}`);
  };

  const handleTermsChange = () => {
    setTermsAccepted((prev) => !prev);
  };

  return (
    <>
      <div className="auth-buttons">
        <Link to="/auth/login">Log in</Link>
        <Link to="/auth/signup" className="active">
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
          <b>Sign up with google</b>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-form-group flex gap-4">
          <div className="w-1/2">
            <label htmlFor="first_name">First Name</label>
            <input
              autoComplete="off"
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Enter your first name"
              required
              onChange={handleChange}
              min={1}
              max={255}
              value={formData.first_name}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="last_name">Last Name</label>
            <input
              autoComplete="off"
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Enter your last name"
              required
              onChange={handleChange}
              min={1}
              max={255}
              value={formData.last_name}
            />
          </div>
        </div>

        <div className="signup-form-group flex gap-4">
          <div className="w-1/2">
            <label htmlFor="username">Username</label>
            <input
              autoComplete="off"
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              required
              onChange={handleChange}
              min={3}
              max={255}
              value={formData.username}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="off"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={handleChange}
              min={8}
              max={255}
              value={formData.email}
            />
          </div>
        </div>

        <div className="signup-form-group flex flex-col">
          <div>
            <label className="flex items-center gap-2">Select Gender</label>
          </div>
          <div className="gender-group">
            <input
              autoComplete="off"
              type="radio"
              id="male"
              name="gender"
              value="male"
              onChange={handleChange}
              checked={formData.gender === "male"}
            />
            <label htmlFor="male">Male</label>

            <input
              autoComplete="off"
              type="radio"
              id="female"
              name="gender"
              value="female"
              onChange={handleChange}
              checked={formData.gender === "female"}
            />
            <label htmlFor="female">Female</label>

            <input
              autoComplete="off"
              type="radio"
              id="other"
              name="gender"
              value="other"
              onChange={handleChange}
              checked={formData.gender === "other"}
            />
            <label htmlFor="other">Other</label>
          </div>
        </div>

        <div className="signup-form-group relative">
          <div>
            <div className="relative pswrd">
              <label htmlFor="password">Password</label>
              <input
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter password"
                required
                onChange={handleChange}
                min={8}
                max={255}
                value={formData.password}
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-10 cursor-pointer"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
            <p className="text-xs font-serif">
              Password must contain at least 8 characters, 1 uppercase letter, 1
              lowercase letter, 1 number, and 1 special character
            </p>
          </div>
        </div>

        <div className="signup-form-group relative">
          <div className="w-full">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              autoComplete="off"
              type={showResetPassword ? "text" : "password"}
              id="confirm"
              name="confirm"
              placeholder="Enter password again"
              required
              onChange={handleChange}
              value={formData.confirm}
            />
            <span
              onClick={toggleResetPasswordVisibility}
              className="absolute right-3 top-10 cursor-pointer"
            >
              {showResetPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <input
            type="checkbox"
            id="terms-and-conditions"
            name="terms-and-conditions"
            onChange={handleTermsChange}
            required
          />
          <label htmlFor="terms-and-conditions">
            I read the{" "}
            <a href="/terms" className="underline text-[#00ff00]">
              Terms and conditions
            </a>{" "}
            and agree
          </label>
        </div>

        <div
          className="signup-form-group"
          style={{
            opacity: termsAccepted ? 1 : 0.4,
          }}
        >
          <button
            type="submit"
            disabled={!termsAccepted}
            style={{
              cursor: termsAccepted ? "pointer" : "not-allowed",
            }}
          >
            Sign up
          </button>
        </div>

        <p className="text-center">
          You already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-serif underline hover:text-[#00ff00] transition duration-300"
          >
            Log in
          </Link>
        </p>
      </form>
    </>
  );
};

export default SignupForm;
