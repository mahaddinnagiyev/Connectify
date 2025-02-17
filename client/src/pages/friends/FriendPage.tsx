import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Tooltip,
} from "@mui/material";
import "./style.css";
import no_profile_photo from "../../assets/no-profile-photo.png";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import GppBadIcon from "@mui/icons-material/GppBad";
import Header from "../../components/header/Header";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import { Users } from "../../services/user/dto/user-dto";
import { getAllUsers } from "../../services/user/user-service";
import { block_and_unblock_user } from "../../services/user/block-list-service";
import { BlockAction } from "../../services/user/dto/block-list-dto";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import FriendList from "../../components/profile/friends/FriendList";
import FriendRequests from "../../components/profile/friends/FriendRequests";

type Section = "allUsers" | "myFriends" | "requests";

const FriendPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>("allUsers");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  useEffect(() => {
    const storedSection = localStorage.getItem(
      "activeFriendSection"
    ) as Section;
    if (storedSection) {
      setActiveSection(storedSection);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "allUsers") {
      setLoading(true);
      fetchAllUsers();
    }
  }, [activeSection]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    localStorage.setItem("activeFriendSection", section);
  };

  const fetchAllUsers = async (): Promise<void> => {
    const response = await getAllUsers();
    if (response.success) {
      setUsers(response.users);
    } else {
      setErrorMessage(
        response.error || response.message || "Failed to fetch users"
      );
    }
    setLoading(false);
  };

  const filterUsers = (items: Users[]) => {
    return items.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const username = user.username.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        username.includes(searchQuery.toLowerCase())
      );
    });
  };

  const block_user = async (id: string) => {
    try {
      const response = await block_and_unblock_user(id, BlockAction.block);
      if (response.success) {
        localStorage.setItem("successMessage", response.message);
      } else {
        if (Array.isArray(response.message)) {
          localStorage.setItem("errorMessage", response.message[0]);
        } else {
          localStorage.setItem(
            "errorMessage",
            response.response?.error ??
              response.message ??
              response.error ??
              "Failed to block user."
          );
        }
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      localStorage.setItem("errorMessage", "Failed to block user.");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "allUsers":
        return (
          <>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <section className="pl-4">
                  <div>
                    <h1 className="font-bold text-4xl mb-3">All Users</h1>
                  </div>
                  <TextField
                    label="Search"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2, width: "100%" }}
                  />
                  <List>
                    {filterUsers(users).map((user) => (
                      <ListItem key={user.id} divider>
                        <ListItemAvatar>
                          <Avatar
                            src={
                              user.account.profile_picture || no_profile_photo
                            }
                            alt={`${user.first_name} ${user.last_name}`}
                            sx={{
                              width: 45,
                              height: 45,
                              marginRight: 2,
                              marginY: 0.5,
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.first_name} ${user.last_name}`}
                          secondary={`@${user.username}`}
                        />
                        <Box display="flex" alignItems="center">
                          <Tooltip title="Go Chat" placement="top">
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ marginRight: 1 }}
                            >
                              <ChatIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Add Friend" placement="top">
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ marginRight: 1 }}
                            >
                              <PersonAddIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Block User" placement="top">
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() =>
                                openConfirmModal(
                                  "Block User",
                                  `Are you sure you want to block ${user.username}?`,
                                  "Block",
                                  () => block_user(user.id)
                                )
                              }
                            >
                              <GppBadIcon />
                            </Button>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </section>
              </>
            )}
          </>
        );

      case "myFriends":
        return <FriendList />;

      case "requests":
        return <FriendRequests />;

      default:
        return null;
    }
  };

  const openConfirmModal = (
    title: string,
    message: string,
    text: string,
    action: () => void
  ) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setConfirmModalText(text);
    setPendingAction(() => action);
    setConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    pendingAction();
    setConfirmModalOpen(false);
  };

  const handleCancel = () => {
    setConfirmModalOpen(false);
  };

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

      {/* Header */}
      <Header />

      <section id="friend-page">
        <div className="friend-page-container">
          {/* Navigation Panel */}
          <div className="user-nav">
            <Button
              onClick={() => handleSectionChange("allUsers")}
              className={activeSection === "allUsers" ? "active" : "outlined"}
            >
              All Users
            </Button>
            <Button
              onClick={() => handleSectionChange("myFriends")}
              className={activeSection === "myFriends" ? "active" : "outlined"}
            >
              My Friends
            </Button>
            <Button
              onClick={() => handleSectionChange("requests")}
              className={activeSection === "requests" ? "active" : "outlined"}
            >
              Requests
            </Button>
          </div>

          {/* Content Panel */}
          <div className="content-panel">
            <div className="rendered-content">
              <div>{renderContent()}</div>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={confirmModalOpen}
        title={confirmModalTitle}
        message={confirmModalMessage}
        color="error"
        confirmText={confirmModalText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default FriendPage;
