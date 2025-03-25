import { useState } from "react";
import "./footerForm.css";
import { createFeedback } from "../../services/feedback/feedback-service";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import CheckModal from "../modals/spinner/CheckModal";

const FooterForm = () => {
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createFeedback(data);

      if (response.success) {
        setSuccessMessage(response.message ?? "Feedback sent successfully!");
        setData({ first_name: "", last_name: "", email: "", message: "" });
      } else {
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error ??
              response.message ??
              response.error ??
              "Failed to send feedback"
          );
        }
      }
    } catch (error) {
      if (error) {
        setErrorMessage("Failed to send feedback");
      }
    } finally {
      setLoading(false);
    }
  };

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

      {loading && <CheckModal message="Sending feedback..." />}

      <section id="footer-form-section">
        <h1 className="text-center text-3xl font-bold">Contact Us</h1>
        <p className="text-center my-2">
          We're here to help! Please fill out the form below.
        </p>

        <form
          method="POST"
          className="footer-contact-form"
          onSubmit={handleSubmit}
        >
          <div className="footer-form-group flex gap-6">
            <div className="flex flex-col w-1/2">
              <label htmlFor="first_name">First Name:</label>
              <input
                autoComplete="off"
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                required
                value={data.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col w-1/2">
              <label htmlFor="last_name">Last Name:</label>
              <input
                autoComplete="off"
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                required
                value={data.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="footer-form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              autoComplete="off"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              value={data.email}
              onChange={handleChange}
            />
          </div>

          <div className="footer-form-group flex flex-col">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              placeholder="Write your message here..."
              required
              onChange={handleChange}
              defaultValue={data.message}
            >
              {data.message}
            </textarea>
          </div>

          <button type="submit" className="footer-submit-btn">
            Send Message
          </button>
        </form>
      </section>
    </>
  );
};

export default FooterForm;
