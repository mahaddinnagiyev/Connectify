import "./signup.css";
import google_logo from "../../assets/google.png";

import { Link } from "react-router-dom";

const Signup = () => {
  const getUrl = (params: string) => {
    const url = window.location.href;

    if (url.split("/").includes(params)) {
      return true;
    }

    return false;
  };

  return (
    <>
      <main id="auth-main">
        <section id="signup">
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

          <div className="google-btn">
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

          <form action="" method="POST" className="signup-form">
            <div className="signup-form-group">
              <div className="flex gap-4">
                <div>
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="signup-form-group">
              <div className="flex gap-4">
                <div>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                required
              />
              <p className="text-xs font-serif">
                Password must contain at least 8 characters, 1 uppercase letter,
                1 lowercase letter, 1 number, and 1 special character
              </p>
            </div>

            <div className="signup-form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                type="confirm"
                id="confirm"
                name="confirm"
                placeholder="Enter password again"
                required
              />
            </div>

            <div className="signup-form-group">
              <button type="submit">Sign up</button>
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
        </section>
      </main>
    </>
  );
};

export default Signup;
