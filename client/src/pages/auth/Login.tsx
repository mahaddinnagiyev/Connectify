import "./login.css";
import google_logo from "../../assets/google.png";

import { Link } from "react-router-dom";

const Login = () => {
  const getUrl = (params: string) => {
    const url = window.location.href

    if (url.split("/").includes(params)) {
        return true
    }

    return false
  };

  return (
    <>
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
            <Link to="/auth/signup" className={getUrl("signup") ? "active" : ""}>Sign up</Link>
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
              <b>Sign in with google</b>
            </p>
          </div>

          <form action="" method="POST" className="login-form">
            <div className="login-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
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
