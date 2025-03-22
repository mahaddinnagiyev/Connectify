import { useState } from "react";
import FooterForm from "../forms/FooterForm";
import "./style.css";

import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const Footer = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("example@gmail.com");
    setCopied(true);

    // Hide the alert after 3 seconds
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <section id="footer">
        <div className="footer-form">
          <FooterForm />
        </div>

        <div className="footer-menu">
          <div className="account-menu">
            <b>Account Menu</b>
            <ul>
              <li>
                <a href="/auth/login">Login</a>
              </li>
              <li>
                <a href="/auth/signup">Sign Up</a>
              </li>
              <li>
                <a href="/user/my-profile">Your Account</a>
              </li>
              <li>
                <a href="/settings">Settings</a>
              </li>
            </ul>
          </div>

          <div className="footer-menu-links">
            <b>Footer Menu</b>
            <ul>
              <li>
                <a href="/faq">FAQ</a>
              </li>
              <li>
                <a href="/contact">Contact Us</a>
              </li>
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms and Conditions</a>
              </li>
            </ul>
          </div>

          <div className="about-menu">
            <b>About Company</b>
            <ul>
              <li>
                <p>Email:</p>{" "}
                <i onClick={copyEmail} className="cursor-pointer">
                  example@gmail.com
                </i>
              </li>
              <li>
                <p>Phone:</p> +1 (123) 456-7890
              </li>
            </ul>
          </div>
        </div>

        {copied && (
          <div className="copied-alert">
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success" variant="filled">Email copied to clipboard</Alert>
            </Stack>
          </div>
        )}
      </section>
    </>
  );
};

export default Footer;
