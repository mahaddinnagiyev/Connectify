import "./css/login.css";
import google_logo from "../../assets/google.png";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import CheckModal from "../../components/modals/spinner/CheckModal";
import LoginForm from "../../components/forms/auth/LoginForm";
import FaceIDForm from "../../components/forms/auth/FaceIDForm";
import { Box, Switch, Tooltip, Typography, Slide } from "@mui/material";
import {
  Password as PasswordIcon,
  ContactEmergency as ContactEmergencyIcon,
} from "@mui/icons-material";
import { TransitionGroup } from "react-transition-group";

enum LoginMethod {
  PASSWORD = "password",
  FACE = "face",
}

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(
    LoginMethod.PASSWORD
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getUrl = (params: string) => {
    const url = window.location.href;
    return url.split("/").includes(params);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginMethod(
      event.target.checked ? LoginMethod.FACE : LoginMethod.PASSWORD
    );
    localStorage.setItem(
      "loginMethod",
      event.target.checked ? "face" : "password"
    );
  };

  useEffect(() => {
    const loginMethod = localStorage.getItem("loginMethod");
    if (loginMethod) {
      setLoginMethod(loginMethod as LoginMethod);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const error = urlParams.get("error");

    if (accessToken) {
      setIsLoading(true);
      localStorage.setItem("successMessage", "Login successfull!");
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/messenger";
      }, 2000);
    } else if (error) {
      setErrorMessage("This email already registered with normal way of login");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.replace(`${process.env.GOOGLE_CLIENT_REDIRECT_URL}`);
  };

  useEffect(() => {
    const message = localStorage.getItem("successMessage");
    const errorMessage = localStorage.getItem("errorMessage");

    if (errorMessage) {
      setErrorMessage(errorMessage);
      localStorage.removeItem("errorMessage");
    } else if (message) {
      setSuccessMessage(message);
      localStorage.removeItem("successMessage");
    }
  }, []);

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

      {isLoading && <CheckModal message={"Checking..."} />}

      <Helmet>
        <title>Connectify | Login</title>
      </Helmet>

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
            <Link
              to="/auth/signup"
              className={getUrl("signup") ? "active" : ""}
            >
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
              <b>Sign in with google</b>
            </p>
          </div>

          <div className="separator">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              padding={2}
            >
              <Tooltip title="Login with password" placement="top">
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      loginMethod === LoginMethod.PASSWORD ? "bold" : "normal",
                    color:
                      loginMethod === LoginMethod.PASSWORD
                        ? "#00ff00"
                        : "inherit",
                    transition: "all 0.3s ease",
                  }}
                  className="switch-text"
                >
                  <PasswordIcon />
                </Typography>
              </Tooltip>
              <Switch
                checked={loginMethod === LoginMethod.FACE}
                onChange={handleSwitchChange}
                sx={{
                  width: 65,
                  "& .MuiSwitch-switchBase": {
                    transitionDuration: "300ms",
                    "&.Mui-checked": {
                      transform: "translateX(28px)",
                      color: "#fff",
                      "& + .MuiSwitch-track": {
                        backgroundColor: "rgba(0, 255, 0, 0.3)",
                        opacity: 1,
                        border: 0,
                      },
                    },
                    "&.Mui-focusVisible .MuiSwitch-thumb": {
                      color: "#00ff00",
                    },
                  },
                  "& .MuiSwitch-thumb": {
                    backgroundColor:
                      loginMethod === LoginMethod.FACE ? "#00ff00" : "#f3f3f3",
                    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
                    transition: "all 0.3s cubic-bezier(.4,.4,.2,1)",
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "rgba(0, 255, 0, 0.1)",
                    opacity: 1,
                    transition: "all 0.3s cubic-bezier(.4,.4,.2,1)",
                  },
                }}
              />
              <Tooltip title="Login with face ID" placement="top">
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      loginMethod === LoginMethod.FACE ? "bold" : "normal",
                    color:
                      loginMethod === LoginMethod.FACE ? "#00ff00" : "inherit",
                    transition: "all 0.3s ease",
                  }}
                  className="switch-text"
                >
                  <ContactEmergencyIcon />
                </Typography>
              </Tooltip>
            </Box>
          </div>

          {/* TransitionGroup ilə formaların mount/unmount animasiyasını təmin edirik */}
          <TransitionGroup>
            {loginMethod === LoginMethod.PASSWORD ? (
              <Slide
                key="password"
                direction="left"
                in
                mountOnEnter
                unmountOnExit
                timeout={300}
              >
                <div>
                  <LoginForm
                    setErrorMessage={setErrorMessage}
                    setSuccessMessage={setSuccessMessage}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </Slide>
            ) : (
              <Slide
                key="face"
                direction="right"
                in
                mountOnEnter
                unmountOnExit
                timeout={300}
              >
                <div>
                  <FaceIDForm />
                </div>
              </Slide>
            )}
          </TransitionGroup>
        </section>
      </main>
    </>
  );
};

export default Login;
