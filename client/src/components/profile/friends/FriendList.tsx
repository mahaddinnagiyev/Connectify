import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import GppBadIcon from "@mui/icons-material/GppBad";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import {
  getFriends,
  removeFriendship,
} from "../../../services/friendship/friendship-service";
import { UserFriendsDTO } from "../../../services/friendship/dto/friendship-dto";
import no_profile_photo from "../../../assets/no-profile-photo.png";
import { block_and_unblock_user } from "../../../services/user/block-list-service";
import { BlockAction } from "../../../services/user/dto/block-list-dto";
import ConfirmModal from "../../modals/confirm/ConfirmModal";
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";

const FriendList = () => {
  const [friends, setFriends] = useState<UserFriendsDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [successMessage, setSuccessMessage] = useState<string | null>("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriends();
        if (response.success) {
          setFriends(response.friends);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

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

  const remove_friend = async (id: string) => {
    try {
      const response = await removeFriendship(id);
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
              "Failed to remove friend."
          );
        }
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      localStorage.setItem("errorMessage", "Failed to remove friend.");
      window.location.reload();
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredFriends = friends.filter((friend) => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
    return (
      friend.username.toLowerCase().includes(searchTerm) ||
      friend.first_name.toLowerCase().includes(searchTerm) ||
      friend.last_name.toLowerCase().includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });

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

      <Box
        sx={{
          width: "100%",
          padding: { xs: 1, sm: 2 },
          paddingTop: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant={isSmallScreen ? "h5" : "h4"}
          gutterBottom
          align={isSmallScreen ? "center" : "left"}
          sx={{ fontWeight: "bold" }}
        >
          Friend List
        </Typography>
        <TextField
          fullWidth
          label="Search user"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ marginBottom: 2 }}
        />
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100px",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              Loading friends...
            </Typography>
          </Box>
        ) : filteredFriends.length > 0 ? (
          <List>
            {filteredFriends.map((friend) => (
              <ListItem key={friend.id} divider>
                {isSmallScreen ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    width="100%"
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={friend.profile_picture ?? no_profile_photo}
                          alt={`${friend.first_name} ${friend.last_name}`}
                          sx={{ width: 56, height: 56, marginBottom: 1 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${friend.first_name} ${friend.last_name}`}
                        secondary={`@${friend.username}`}
                        primaryTypographyProps={{ align: "center" }}
                        secondaryTypographyProps={{ align: "center" }}
                        onClick={() =>
                          (window.location.href = `/user/@${friend.username}`)
                        }
                        className="cursor-pointer"
                      />
                    </Box>
                    <Box display="flex" justifyContent="center" width="100%">
                      <Tooltip title="Go Chat" placement="top">
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          sx={{ marginRight: 1 }}
                        >
                          <ChatIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Block User" placement="top">
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          sx={{ marginRight: 1 }}
                          onClick={() =>
                            openConfirmModal(
                              "Confirm Block",
                              "Are you sure you want to block this user?",
                              "Block",
                              () => block_user(friend.friend_id)
                            )
                          }
                        >
                          <GppBadIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Remove Friend" placement="top">
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() =>
                            openConfirmModal(
                              "Confirm Remove",
                              "Are you sure you want to remove this friend?",
                              "Remove",
                              () => remove_friend(friend.id)
                            )
                          }
                        >
                          <PersonRemoveIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ListItemAvatar>
                      <Avatar
                        src={friend.profile_picture ?? no_profile_photo}
                        alt={`${friend.first_name} ${friend.last_name}`}
                        sx={{
                          width: 45,
                          height: 45,
                          marginRight: 2,
                          marginY: 0.5,
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${friend.first_name} ${friend.last_name}`}
                      secondary={`@${friend.username}`}
                      onClick={() =>
                        (window.location.href = `/user/@${friend.username}`)
                      }
                      className="cursor-pointer"
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
                      <Tooltip title="Block User" placement="top">
                        <Button
                          variant="contained"
                          color="warning"
                          sx={{ marginRight: 1 }}
                          onClick={() =>
                            openConfirmModal(
                              "Confirm Block",
                              `Are you sure you want to block ${friend.username}?`,
                              "Block",
                              () => block_user(friend.friend_id)
                            )
                          }
                        >
                          <GppBadIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Remove Friend" placement="top">
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() =>
                            openConfirmModal(
                              "Confirm Remove",
                              "Are you sure you want to remove this friend?",
                              "Remove",
                              () => remove_friend(friend.id)
                            )
                          }
                        >
                          <PersonRemoveIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" align="center">
            No friends found.
          </Typography>
        )}

        <ConfirmModal
          open={confirmModalOpen}
          title={confirmModalTitle}
          message={confirmModalMessage}
          color="error"
          confirmText={confirmModalText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Box>
    </>
  );
};

export default FriendList;
