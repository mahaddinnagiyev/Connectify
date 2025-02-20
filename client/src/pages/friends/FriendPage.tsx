import React, { useState, useEffect } from "react";
import {
  Button,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import Header from "../../components/header/Header";
import AllUsers from "../../components/friends/AllUsers";
import FriendList from "../../components/friends/FriendList";
import FriendRequests from "../../components/friends/FriendRequests";
import "./style.css";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";

type Section = "allUsers" | "myFriends" | "requests";

const FriendPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>("allUsers");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const storedSection = localStorage.getItem(
      "activeFriendSection"
    ) as Section;
    if (storedSection) {
      setActiveSection(storedSection);
    }
  }, []);

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newSection: Section | null
  ) => {
    if (newSection !== null) {
      setActiveSection(newSection);
      localStorage.setItem("activeFriendSection", newSection);
    }
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    localStorage.setItem("activeFriendSection", section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "allUsers":
        return <AllUsers />;
      case "myFriends":
        return <FriendList />;
      case "requests":
        return <FriendRequests />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const successMessage = localStorage.getItem("successMessage");
    const errorMessage = localStorage.getItem("errorMessage");

    if (successMessage) {
      setSuccessMessage(successMessage);
      localStorage.removeItem("successMessage");
    } else if (errorMessage) {
      setErrorMessage(errorMessage);
      localStorage.removeItem("errorMessage");
    }
  }, []);

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

      <Header />

      <section id="friend-page">
        <div className="friend-page-container">
          {/* Navigation Panel */}
          {isSmallScreen ? (
            <ToggleButtonGroup
              value={activeSection}
              exclusive
              onChange={handleToggleChange}
              aria-label="friend navigation"
              sx={{
                marginBottom: 3,
                display: "flex",
                justifyContent: "center",
                gap: 1,
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <ToggleButton
                value="allUsers"
                aria-label="all users"
                className={
                  activeSection === "allUsers"
                    ? "user-nav-btn-active"
                    : "outlined user-nav-btn"
                }
                sx={{ borderRadius: 25 }}
              >
                All Users
              </ToggleButton>
              <ToggleButton
                value="myFriends"
                aria-label="my friends"
                className={
                  activeSection === "myFriends"
                    ? "user-nav-btn-active"
                    : "outlined user-nav-btn"
                }
                sx={{ borderRadius: 25 }}
              >
                My Friends
              </ToggleButton>
              <ToggleButton
                value="requests"
                aria-label="friend requests"
                className={
                  activeSection === "requests"
                    ? "user-nav-btn-active"
                    : "outlined user-nav-btn"
                }
                sx={{ borderRadius: 25 }}
              >
                Friend Requests
              </ToggleButton>
            </ToggleButtonGroup>
          ) : (
            <Box className="user-nav">
              <Button
                onClick={() => handleSectionChange("allUsers")}
                className={activeSection === "allUsers" ? "active" : "outlined"}
              >
                All Users
              </Button>
              <Button
                onClick={() => handleSectionChange("myFriends")}
                className={
                  activeSection === "myFriends" ? "active" : "outlined"
                }
              >
                My Friends
              </Button>
              <Button
                onClick={() => handleSectionChange("requests")}
                className={activeSection === "requests" ? "active" : "outlined"}
              >
                Friend Requests
              </Button>
            </Box>
          )}

          {/* Content Panel */}
          <div className="content-panel">
            <div className="rendered-content">{renderContent()}</div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FriendPage;
