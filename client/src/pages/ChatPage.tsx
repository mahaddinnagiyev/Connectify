import { useEffect, useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Messenger from "../components/messenger/Messenger";
import MainSpinner from "../components/modals/spinner/MainSpinner";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
