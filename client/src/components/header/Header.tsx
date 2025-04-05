import { useEffect, useRef, useState } from "react";

import no_profile_photo from "../../assets/no-profile-photo.png";

import "../../colors.css";
import "./style.css";

import {
  Chat as ChatIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  SmartToy as SmartToyIcon,
  LiveHelp as LiveHelpIcon,
  // Forum as ForumIcon,
  ImportContacts as ImportContactsIcon,
  AccountBox as AccountBoxIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import { Badge, Tooltip } from "@mui/material";
import { logout } from "../../services/auth/auth-service";
import ErrorMessage from "../messages/ErrorMessage";
import CheckModal from "../modals/spinner/CheckModal";
import { getUserById } from "../../services/user/user-service";
import { getFriendRequests } from "../../services/friendship/friendship-service";
import { User } from "../../services/user/dto/user-dto";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [receivedRequestsCount, setReceivedRequestsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const logo =
    "https://rjxpdgpxdhwulirasumb.supabase.co/storage/v1/object/public/site-configurations/images/app-logo.webp";

  const toggleMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await logout();

      if (response.success) {
        localStorage.removeItem("activeSettingsTab");
        localStorage.removeItem("activeTab");
        localStorage.removeItem(`cachedChats_${currentUser?.id}`);
        localStorage.removeItem("videoVolume");
        localStorage.removeItem(`cachedProfile_${currentUser?.id}`);
        localStorage.removeItem(`cached_account_settings_${currentUser?.id}`);

        if (localStorage.getItem("cachedProfile_null")) {
          localStorage.removeItem("cachedProfile_null");
        }

        window.location.href = "/auth/login";
      } else {
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
    } catch (error) {
      if (error) {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserById().then((response) => {
      if (response.success) {
        setCurrentUser(response.user);
        setProfilePicture(response.account.profile_picture);
      }
    });
  }, []);

  useEffect(() => {
    getFriendRequests().then((response) => {
      if (response.success) {
        setReceivedRequestsCount(response.receivedRequests.length);
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
        <div
          ref={menuRef}
          className={`navbar ${isMenuOpen ? "open" : ""} flex gap-8`}
        >
          <a href="/messenger">
            <ChatIcon className="mt-1" /> Messenger
          </a>
          <Tooltip
            title="Project in development phase. Groups will be available soon"
            placement="top"
          >
            <a href="#">
              <GroupsIcon /> Groups
            </a>
          </Tooltip>
          {/* <a href="/channels">
          <ForumIcon /> Channels
        </a> */}
          <a href="/friends">
            <Badge
              badgeContent={receivedRequestsCount}
              color="error"
              className="flex gap-1"
              sx={{
                "& .MuiBadge-badge": {
                  top: "3px",
                  right: "-5px",
                },
              }}
            >
              <PeopleIcon /> Friends
            </Badge>
          </a>
          <Tooltip
            title="Project in development phase. Bots will be available soon"
            placement="top"
          >
            <a href="#">
              <SmartToyIcon /> Bots
            </a>
          </Tooltip>

          {/* Show profile actions inside the burger menu when open */}
          {isMenuOpen && (
            <div className="profile-actions-burger flex flex-col gap-2">
              <a href="/user/my-profile">
                <img
                  src={profilePicture ?? no_profile_photo}
                  alt=""
                  style={{ width: "25px", height: "25px", borderRadius: "50%" }}
                  className="border-2 border-[var(--primary-color)]"
                />{" "}
                View Profile
              </a>
              <a href="/settings">
                <SettingsIcon /> Settings
              </a>
              <a href="/contact">
                <ImportContactsIcon /> Contact Us
              </a>
              <a href="/faq">
                <LiveHelpIcon /> FAQ
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
            <a href="/contact" className="rounded-lg">
              <ImportContactsIcon /> Contact Us
            </a>
            <a href="/faq" className="rounded-lg">
              <LiveHelpIcon /> FAQ
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
