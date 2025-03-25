import { useState } from "react";
import FooterForm from "../forms/FooterForm";
import "./style.css";

import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import { Tooltip } from "@mui/material";
import SuccessMessage from "../messages/SuccessMessage";

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
      <section id="footer" className="relative">
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
                <p>Social Media</p>
                <div className="flex gap-3 mt-1">
                  <Tooltip title="LinkedIn" placement="top">
                    <a
                      href="https://www.linkedin.com/in/nagiyev-mahaddin-3395a72a0/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedInIcon style={{ fontSize: "1.7rem" }} />
                    </a>
                  </Tooltip>
                  <Tooltip title="GitHub" placement="top">
                    <a
                      href="https://github.com/mahaddinnagiyev"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitHubIcon style={{ fontSize: "1.7rem" }} />
                    </a>
                  </Tooltip>
                  <Tooltip title="Email" placement="top">
                    <a
                      href="mailto:nagiyev.mahaddin@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <EmailIcon style={{ fontSize: "1.7rem" }} />
                    </a>
                  </Tooltip>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright absolute bottom-3 left-1/2 transform -translate-x-1/2 md:text-sm text-xs">
          <b>All rights reserved. Copyright &copy; 2025</b>
        </div>

        {copied && (
          <SuccessMessage message="Copied to clipboard!" onClose={() => {}} />
        )}
      </section>
    </>
  );
};

export default Footer;
