import { useState } from "react";
import "./css/style.css";
import { CSSTransition } from "react-transition-group";
import Header from "../../components/header/Header";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const SETTINGS_ICON = "/images/site-setting-icon.png";
  const APP_SETTINGS = "/images/site-settings.png";
  const MICROPHONE_SETTINGS = "/images/microphone.png";
  const NOTIFICATION_SETTINGS = "/images/notification.png";

  const faqs = [
    {
      question: "How can I activate my audio button to send voice message?",
      answer: (
        <div className="space-y-4">
          <p>1. Open settings from the navigation sidebar:</p>
          <img
            src={SETTINGS_ICON}
            alt="Settings navigation"
            className="w-full max-w-[350px] border-2 border-[#00ff0055] rounded-lg shadow-sm p-1"
          />

          <p>2. Navigate to Site Settings Section:</p>
          <img
            src={APP_SETTINGS}
            alt="App settings screen"
            className="w-full max-w-[300px] border-2 border-[#00ff0055] rounded-lg shadow-sm"
          />

          <p>3. Find Microphone settings and set to 'Allow':</p>
          <img
            src={MICROPHONE_SETTINGS}
            alt="Microphone settings"
            className="w-full max-w-[300px] border-2 border-[#00ff0055] rounded-lg shadow-sm"
          />

          <p>4. Refresh the page.</p>
          <p>5. Click on the audio button to send voice message.</p>
        </div>
      ),
    },
    {
      question: "How can I get new message notification?",
      answer: (
        <div className="space-y-4">
          <p>1. Open settings from the navigation sidebar:</p>
          <img
            src={SETTINGS_ICON}
            alt="Settings navigation"
            className="w-full max-w-[200px] border-2 border-[#00ff0055] rounded-lg shadow-sm p-1"
          />

          <p>2. Navigate to Site Settings section:</p>
          <img
            src={APP_SETTINGS}
            alt="App settings screen"
            className="w-full max-w-[300px] border-2 border-[#00ff0055] rounded-lg shadow-sm"
          />

          <p>3. Find Notification settings and set to 'Allow':</p>
          <img
            src={NOTIFICATION_SETTINGS}
            alt="Notification settings"
            className="w-full max-w-[300px] border-2 border-[#00ff0055] rounded-lg shadow-sm"
          />

          <p>4. Refresh the page.</p>
          <p>5. You will get new message notification.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1 overflow-y-auto pt-[250px]">
        <h1
          className="text-4xl font-bold text-center mb-8"
          style={{ color: "#00ff00" }}
        >
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <svg
                  className={`w-6 h-6 ml-4 transform transition-transform ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  style={{
                    color: openIndex === index ? "#00ff00" : "#000",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>

              <CSSTransition
                in={openIndex === index}
                timeout={300}
                classNames="faq-content"
                unmountOnExit
              >
                <div className="px-6 pb-4 pt-2 text-gray-600 space-y-4 overflow-hidden">
                  {faq.answer}
                </div>
              </CSSTransition>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
