import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Chat as ChatIcon,
  GppBad as GppBadIcon,
  PersonRemove as PersonRemoveIcon,
} from "@mui/icons-material";
import {
  getFriends,
  removeFriendship,
} from "../../services/friendship/friendship-service";
import { UserFriendsDTO } from "../../services/friendship/dto/friendship-dto";
import no_profile_photo from "../../assets/no-profile-photo.png";
import {
  block_and_unblock_user,
  get_block_list,
} from "../../services/user/block-list-service";
import {
  BlockAction,
  BlockListDTO,
} from "../../services/user/dto/block-list-dto";
import ConfirmModal from "../modals/confirm/ConfirmModal";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import { createSocket } from "../../services/socket/socket-service";
import CheckModal from "../modals/spinner/CheckModal";
import { Socket } from "socket.io-client";

const FriendList = () => {
  const [friends, setFriends] = useState<UserFriendsDTO[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [successMessage, setSuccessMessage] = useState<string | null>("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const navigate = useNavigate();

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
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    const createSocketInstance = async () => {
      const socketInstance = await createSocket();
      setSocket(socketInstance ?? null);
    };
    createSocketInstance();
  });

  const fetchBlockedUsers = async () => {
    try {
      const result = await get_block_list();
      if (result.success) {
        const blocked = result.blockList.map((item: BlockListDTO) => item.id);
        setBlockedUsers(blocked);
      }
    } catch (error) {
      console.error("Failed to fetch block list:", error);
    }
  };

  const handleGoChat = (userId: string) => {
    socket?.emit("joinRoom", { user2Id: userId });
    socket?.once("joinRoomSuccess", (data: { roomId: string }) => {
      if (data && data.roomId) {
        navigate(`/messenger?room=${data.roomId}`);
      }
    });
  };

  const block_user = async (id: string) => {
    try {
      setPending(true);
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
      if (error) {
        localStorage.setItem("errorMessage", "Failed to block user.");
      }
    } finally {
      setPending(false);
    }
  };

  const unblock_user = async (id: string) => {
    try {
      setPending(true);
      const response = await block_and_unblock_user(id, BlockAction.unblock);
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
              "Failed to unblock user."
          );
        }
      }
      window.location.reload();
    } catch (error) {
      if (error) {
        localStorage.setItem("errorMessage", "Failed to unblock user.");
      }
    } finally {
      setPending(false);
    }
  };

  const remove_friend = async (id: string) => {
    try {
      setPending(true);
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
      if (error) {
        localStorage.setItem("errorMessage", "Failed to remove friend.");
      }
    } finally {
      setPending(false);
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
      {pending && <CheckModal message="Processing..." />}

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
          autoComplete="off"
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
                          sx={{
                            width: 56,
                            height: 56,
                            marginBottom: 1,
                            border: "1px solid var(--primary-color)",
                          }}
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
                          onClick={() => handleGoChat(friend.friend_id)}
                        >
                          <ChatIcon />
                        </Button>
                      </Tooltip>
                      {blockedUsers.includes(friend.friend_id) ? (
                        <Tooltip title="Unblock User" placement="top">
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            sx={{ marginRight: 1 }}
                            onClick={() =>
                              openConfirmModal(
                                "Unblock User",
                                `Are you sure you want to unblock ${friend.username}?`,
                                "Unblock",
                                () => unblock_user(friend.friend_id)
                              )
                            }
                          >
                            <GppBadIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Block User" placement="top">
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            sx={{ marginRight: 1 }}
                            onClick={() =>
                              openConfirmModal(
                                "Block User",
                                `Are you sure you want to block ${friend.username}?`,
                                "Block",
                                () => block_user(friend.friend_id)
                              )
                            }
                          >
                            <GppBadIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
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
                              () => remove_friend(friend.friend_id)
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
                          border: "1px solid var(--primary-color)",
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
                          onClick={() => handleGoChat(friend.friend_id)}
                        >
                          <ChatIcon />
                        </Button>
                      </Tooltip>
                      {blockedUsers.includes(friend.friend_id) ? (
                        <Tooltip title="Unblock User" placement="top">
                          <Button
                            variant="contained"
                            color="info"
                            sx={{ marginRight: 1 }}
                            onClick={() =>
                              openConfirmModal(
                                "Unblock User",
                                `Are you sure you want to unblock ${friend.username}?`,
                                "Unblock",
                                () => unblock_user(friend.friend_id)
                              )
                            }
                          >
                            <GppBadIcon />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Block User" placement="top">
                          <Button
                            variant="contained"
                            color="warning"
                            sx={{ marginRight: 1 }}
                            onClick={() =>
                              openConfirmModal(
                                "Block User",
                                `Are you sure you want to block ${friend.username}?`,
                                "Block",
                                () => block_user(friend.friend_id)
                              )
                            }
                          >
                            <GppBadIcon />
                          </Button>
                        </Tooltip>
                      )}
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
