import FooterForm from "../../components/forms/FooterForm";
import "./css/style.css";

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
    </div>
  );
};

export default ContactUsPage;
