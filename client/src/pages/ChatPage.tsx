import { useEffect, useState } from "react";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Messenger from "../components/messenger/Messenger";
import MainSpinner from "../components/modals/MainSpinner";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading or API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // After 3 seconds, loading is complete
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);

  return (
    <>
      {isLoading ? (
        <MainSpinner /> // Show spinner while loading
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
