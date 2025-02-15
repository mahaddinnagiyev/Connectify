import { useEffect, useState } from "react";

import logo from "../../assets/app-logo.png";
import no_profile_photo from "../../assets/no-profile-photo.png";

import "../../colors.css";
import "./style.css";

import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import SmartToyIcon from "@mui/icons-material/SmartToy";
// import ForumIcon from '@mui/icons-material/Forum';
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../../services/auth/auth-service";
import ErrorMessage from "../messages/ErrorMessage";
import CheckModal from "../modals/spinner/CheckModal";
import SettingsIcon from "@mui/icons-material/Settings";
import { getUserById } from "../../services/user/user-service";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const response = await logout();

    if (response.success) {
      localStorage.removeItem("token");

      window.location.href = "/auth/login";
    } else {
      setIsLoading(false);
      if (Array.isArray(response.message)) {
        setErrorMessage(response.message[0]);
      } else {
        setErrorMessage(
          response.response?.error ??
            response.message ??
            response.error ??
            "Logout failed"
        );
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUserById().then((response) => {
      if (response.success) {
        setProfilePicture(response.account.profile_picture);
      }
    });
  }, []);

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {isLoading && <CheckModal message={"Loggin out..."} />}

      <div className="header">
        {/* Logo */}
        <div>
          <a href="/">
            {logo && <img src={logo} alt="App Logo" className="app-logo" />}
          </a>
        </div>

        {/* Navbar buttons */}
        <div className={`navbar ${isMenuOpen ? "open" : ""} flex gap-8`}>
          <a href="/chat">
            <ChatIcon className="mt-1" /> Messenger
          </a>
          <a href="/groups">
            <GroupsIcon /> Groups
          </a>
          {/* <a href="/channels">
          <ForumIcon /> Channels
        </a> */}
          <a href="/friends">
            <PeopleIcon /> Friends
          </a>
          <a href="/bot">
            <SmartToyIcon /> Bots
          </a>

          {/* Show profile actions inside the burger menu when open */}
          {isMenuOpen && (
            <div className="profile-actions-burger flex flex-col gap-2">
              <a href="/user/my-profile">
                <AccountBoxIcon /> View Profile
              </a>
              <a href="/settings">
                <SettingsIcon /> Settings
              </a>
              <a onClick={handleLogout} className="text-center cursor-pointer">
                <LogoutIcon /> Logout
              </a>
            </div>
          )}
        </div>

        {/* Burger menu */}
        <div className="burger-menu" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Profile (hidden for mobile unless burger menu is open) */}
        <div className="profile-container flex gap-5 mr-3 items-center">
          <img
            src={profilePicture ?? no_profile_photo}
            alt=""
            className="w-10 h-10 rounded-full cursor-pointer profile-img"
          />
          <div className="profile-actions">
            <a href="/user/my-profile" className="rounded-lg">
              <AccountBoxIcon /> View Profile
            </a>
            <a href="/settings" className="rounded-lg">
              <SettingsIcon /> Settings
            </a>
            <a onClick={handleLogout} className="cursor-pointer rounded-lg">
              <LogoutIcon /> Logout
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
