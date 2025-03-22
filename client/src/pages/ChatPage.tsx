import { useEffect, useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Messenger from "../components/messenger/Messenger";
import MainSpinner from "../components/modals/spinner/MainSpinner";
import SuccessMessage from "../components/messages/SuccessMessage";
import InfoMessage from "../components/messages/InfoMessage";
import { useLocation } from "react-router-dom";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const location = useLocation();

  const screenWidth = window.innerWidth;

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
  console.log(location);
  console.log(isRoomPage);

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
          {screenWidth < 768 && isRoomPage ? null : <Header />}
          <Messenger />
          {screenWidth < 768 && isRoomPage ? null : <Footer />}
        </>
      )}
    </>
  );
};

export default ChatPage;
