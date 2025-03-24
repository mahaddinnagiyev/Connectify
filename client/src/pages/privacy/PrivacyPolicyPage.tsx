const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl bg-white p-8 rounded-2xl shadow-lg text-gray-800 w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-green-500">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Last updated: 24 March 2025
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              1. Introduction
            </h2>
            <p className="text-gray-700 mt-2">
              Welcome to Connectify. Your privacy is important to us. This
              Privacy Policy explains how we collect, use, and protect your
              personal information when using our chat application.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              2. Information We Collect
            </h2>
            <p className="text-gray-700 mt-2">
              We collect information you provide during account registration,
              including your name, email, and profile details. We may also
              collect usage data such as messages, interactions, and device
              information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 mt-2">
              Your information is used to improve our services, ensure security,
              and enhance user experience. We do not sell your data to third
              parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              4. Data Security
            </h2>
            <p className="text-gray-700 mt-2">
              We implement strong security measures to protect your data.
              However, no online service can be 100% secure, so we encourage you
              to use strong passwords and be cautious online.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              5. Cookies and Tracking
            </h2>
            <p className="text-gray-700 mt-2">
              We use cookies to enhance your experience. You can manage cookie
              settings in your browser.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              6. Third-Party Services
            </h2>
            <p className="text-gray-700 mt-2">
              We may use third-party analytics tools to improve our service.
              These services may collect anonymous data about your usage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              7. Your Rights
            </h2>
            <p className="text-gray-700 mt-2">
              You have the right to access, edit, or delete your data. If you
              wish to exercise these rights, contact us at
              nagiyev.mahaddin@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-500">
              8. Updates to This Policy
            </h2>
            <p className="text-gray-700 mt-2">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated date.
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              If you have any questions, please contact us at
              <span className="text-green-500 font-semibold">
                {" "}
                nagiyev.mahaddin@gmail.com
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
