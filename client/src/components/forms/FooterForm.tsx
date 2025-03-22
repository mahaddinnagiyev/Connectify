import "./footerForm.css";

const FooterForm = () => {
  return (
    <section id="footer-form-section">
      <h1 className="text-center text-3xl font-bold">Contact Us</h1>
      <p className="text-center my-2">
        We're here to help! Please fill out the form below.
      </p>

      <form method="POST" className="footer-contact-form">
        <div className="footer-form-group flex gap-6">
          <div className="flex flex-col w-1/2">
            <label htmlFor="name">Name:</label>
            <input
              autoComplete="off"
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label htmlFor="surname">Surname:</label>
            <input
              autoComplete="off"
              type="text"
              id="surname"
              name="surname"
              placeholder="Enter your surname"
              required
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
          />
        </div>

        <div className="footer-form-group flex flex-col">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your message here..."
            required
          ></textarea>
        </div>

        <button type="submit" className="footer-submit-btn">
          Send Message
        </button>
      </form>
    </section>
  );
};

export default FooterForm;
