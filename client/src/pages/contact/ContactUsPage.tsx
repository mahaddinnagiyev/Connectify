import FooterForm from "../../components/forms/FooterForm";
import "./css/style.css";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import { Tooltip } from "@mui/material";

const ContactUsPage = () => {
  return (
    <div className="contact-container">
      <section className="contact-header">
        <h1>Contact Us</h1>
        <p>
          We’re here to help! Drop us a message and we'll get back to you ASAP.
        </p>
      </section>
      <section className="contact-form-section">
        <FooterForm />
      </section>
      <section className="social-media-section">
        <h2>Social Media</h2>
        <div className="social-icons">
          <Tooltip title="LinkedIn" placement="top">
            <a
              href="https://www.linkedin.com/in/nagiyev-mahaddin-3395a72a0/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <LinkedInIcon style={{ fontSize: "2.5rem" }} />
            </a>
          </Tooltip>
          <Tooltip title="GitHub" placement="top">
            <a
              href="https://github.com/mahaddinnagiyev"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <GitHubIcon style={{ fontSize: "2.5rem" }} />
            </a>
          </Tooltip>
          <Tooltip title="Email" placement="top">
            <a
              href="mailto:nagiyev.mahaddin@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <EmailIcon style={{ fontSize: "2.5rem" }} />
            </a>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
