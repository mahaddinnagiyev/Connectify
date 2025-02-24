import { useEffect, useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Messenger from "../components/messenger/Messenger";
import MainSpinner from "../components/modals/spinner/MainSpinner";
import SuccessMessage from "../components/messages/SuccessMessage";
import InfoMessage from "../components/messages/InfoMessage";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const message = localStorage.getItem("successMessage");

    if (message) {
      setSuccessMessage(message);
      localStorage.removeItem("successMessage");
    }

    const infoMesssage = localStorage.getItem("infoMessage");

    if (infoMesssage) {
      setInfoMessage(infoMesssage);
      localStorage.removeItem("infoMessage");
    }
  }, []);

  return (
    <>
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {infoMessage && (
        <InfoMessage
          message={infoMessage}
          onClose={() => setInfoMessage(null)}
        />
      )}

      {isLoading ? (
        <MainSpinner />
      ) : (
        <>
          <Header />
          <Messenger />
          <Footer />
        </>
      )}
    </>
  );
};

export default ChatPage;
