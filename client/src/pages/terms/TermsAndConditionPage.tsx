import { Helmet } from "react-helmet-async";

const TermAndConditionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 flex items-center justify-center px-4 py-8">
      <Helmet>
        <title>Connectify | Terms And Conditions</title>
      </Helmet>

      <div
        className="bg-white shadow-2xl rounded-2xl max-w-4xl w-full p-10 overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        <h1 className="text-5xl font-extrabold text-center mb-10 text-[var(--primary-color)]">
          Terms and Conditions
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            1. Acceptance of Terms
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Welcome to Connectify. By accessing and using our chat application,
            you agree to be bound by these Terms and Conditions. If you do not
            agree with any of these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            2. Eligibility and User Account
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            You must be at least 13 years old (or the minimum legal age in your
            jurisdiction) to use our chat application. By registering an
            account, you agree to provide accurate and complete information.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account and password, and for restricting access to your device.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            3. Use of the Service
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            Our chat application is designed to facilitate communication and
            social interactions. You agree to use the service in a manner that
            is lawful, ethical, and respectful to other users.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            You must not engage in any activities that could harm the
            functionality of the application or the experience of other users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            4. Intellectual Property
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            All content, including text, images, logos, and software, is the
            property of Connectify or its licensors and is protected by
            copyright and other intellectual property laws.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            You agree not to reproduce, modify, distribute, or create derivative
            works from any content on our platform without our prior written
            consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            5. Prohibited Conduct
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            While using our chat application, you agree not to:
          </p>
          <ul className="list-disc list-inside text-lg text-gray-600 leading-relaxed mb-2">
            <li>
              Post or transmit any content that is defamatory, harassing, or
              otherwise unlawful.
            </li>
            <li>
              Engage in spamming, phishing, or other fraudulent activities.
            </li>
            <li>
              Attempt to gain unauthorized access to our systems or interfere
              with the proper functioning of the service.
            </li>
          </ul>
          <p className="text-lg text-gray-600 leading-relaxed">
            Violation of these terms may result in the suspension or termination
            of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">6. Privacy</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Your privacy is important to us. Please refer to our Privacy Policy
            for information on how we collect, use, and disclose personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            7. Disclaimers and Limitation of Liability
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            Our chat application is provided "as is" without warranties of any
            kind. We do not guarantee that the service will be uninterrupted or
            error-free.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            In no event shall Connectify be liable for any indirect, incidental,
            or consequential damages arising out of your use or inability to use
            the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            8. Termination
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate your access to the chat
            application at any time and without notice if you breach these Terms
            and Conditions or if we deem it necessary for the protection of our
            users and service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            9. Indemnification
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            You agree to indemnify, defend, and hold harmless Connectify, its
            affiliates, and their respective officers, directors, employees, and
            agents from any claims, damages, or losses arising out of your use
            of the service or your violation of these Terms and Conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            10. Changes to the Terms
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We reserve the right to modify or update these Terms and Conditions
            at any time. Any changes will be posted on this page with an updated
            effective date. Your continued use of the service after any
            modifications indicates your acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            11. Contact Information
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            If you have any questions or concerns regarding these Terms and
            Conditions, please contact us at:
          </p>
          <p
            className="text-lg font-bold text-gray-700 mt-2 cursor-pointer"
            onClick={() => {
              window.navigator.clipboard.writeText(
                "nagiyev.mahaddin@gmail.com"
              );
              alert("Email copied to clipboard");
            }}
          >
            nagiyev.mahaddin@gmail.com
          </p>
        </section>

        <section>
          <p className="text-lg text-gray-600 leading-relaxed">
            By using our chat application, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and Conditions.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermAndConditionPage;
