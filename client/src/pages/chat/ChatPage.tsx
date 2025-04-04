import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Messenger from "../../components/messenger/Messenger";
import SuccessMessage from "../../components/messages/SuccessMessage";
import InfoMessage from "../../components/messages/InfoMessage";

const ChatPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const location = useLocation();

  const screenWidth = window.innerWidth;

  useEffect(() => {
    const message = localStorage.getItem("successMessage");

    if (message) {
      setSuccessMessage(message);
      localStorage.removeItem("successMessage");
    }

    const infoMesssages = localStorage.getItem("infoMessage");

    if (infoMesssages) {
      setInfoMessage(infoMesssages);
      localStorage.removeItem("infoMessage");
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "infoMessage") {
        setInfoMessage(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isRoomPage = location.search.includes("room");

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

      <Helmet>
        <title>Connectify | Messenger</title>
      </Helmet>

      {screenWidth < 768 && isRoomPage ? null : <Header />}
      <Messenger />
      {screenWidth < 768 && isRoomPage ? null : <Footer />}
    </>
  );
};

export default ChatPage;
