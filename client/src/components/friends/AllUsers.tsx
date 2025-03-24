import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TimerIcon from "@mui/icons-material/Timer";
import CheckIcon from "@mui/icons-material/Check";
import ChatIcon from "@mui/icons-material/Chat";
import GppBadIcon from "@mui/icons-material/GppBad";
import no_profile_photo from "../../assets/no-profile-photo.png";
import { getAllUsers } from "../../services/user/user-service";
import {
  getAllFriendshipRequests,
  sendFriendshipRequest,
} from "../../services/friendship/friendship-service";
import {
  block_and_unblock_user,
  get_block_list,
} from "../../services/user/block-list-service";
import {
  BlockAction,
  BlockListDTO,
} from "../../services/user/dto/block-list-dto";
import { getToken } from "../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";
import { Users } from "../../services/user/dto/user-dto";
import { FriendshipStatus } from "../../services/friendship/enum/friendship-status.enum";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import { UserFriendsDTO } from "../../services/friendship/dto/friendship-dto";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import { socket } from "../../services/socket/socket-service";
import { useNavigate } from "react-router-dom";

const AllUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>([]);
  const [pendingFriends, setPendingFriends] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [successMessage, setSuccessMessage] = useState<string | null>("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
    fetchAcceptedFriends();
    fetchPendingFriends();
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const result = await get_block_list();
      if (result.success) {
        const blocked = result.blockList.map(
          (item: BlockListDTO) => item.blocked_id
        );
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

  const fetchAllUsers = async () => {
    setLoading(true);
    const response = await getAllUsers();
    if (response.success) {
      const token = await getToken();
      if (token) {
        const decodedToken: { id: string } = jwtDecode(token);
        const filteredUsers = response.users.filter(
          (user: Users) => user.id !== decodedToken.id
        );
        setUsers(filteredUsers);
      }
    }
    setLoading(false);
  };

  const fetchAcceptedFriends = async () => {
    try {
      const response = await getAllFriendshipRequests();
      if (response.success) {
        const accepted = response.friends
          .filter((friend: UserFriendsDTO) => friend.status === "accepted")
          .map((friend: UserFriendsDTO) => friend.friend_id);
        setAcceptedFriends(accepted);
      }
    } catch (error) {
      console.error("Error fetching accepted friends:", error);
    }
  };

  const fetchPendingFriends = async () => {
    try {
      const response = await getAllFriendshipRequests();
      if (response.success) {
        const pending = response.friends
          .filter(
            (friend: UserFriendsDTO) =>
              friend.status === FriendshipStatus.pending
          )
          .map((friend: UserFriendsDTO) => friend.friend_id);
        setPendingFriends(pending);
      }
    } catch (error) {
      console.error("Error fetching pending friends:", error);
    }
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
        fetchAllUsers();
        fetchBlockedUsers();
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(
          response.response.message ??
            response.response.error ??
            response.message ??
            response.error ??
            "Failed to block user"
        );
      }
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const unblock_user = async (id: string) => {
    try {
      const response = await block_and_unblock_user(id, BlockAction.unblock);
      if (response.success) {
        fetchAllUsers();
        fetchBlockedUsers();
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(
          response.response.message ??
            response.response.error ??
            response.message ??
            response.error ??
            "Failed to unblock user"
        );
      }
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  };

  const send_friend_request = async (id: string) => {
    try {
      const response = await sendFriendshipRequest(id);
      if (response.success) {
        setSuccessMessage(response.message);
      } else {
        setErrorMessage(
          response.response?.error ??
            response.response.message ??
            response.message ??
            response.error ??
            "Failed to send friend request"
        );
      }
    } catch (error) {
      setErrorMessage("Failed to send friend request");
      console.error("Failed to send friend request:", error);
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

      <Box>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body1">Loading...</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              paddingTop: 0,
              paddingX: { xs: 1, sm: 2 },
              paddingBottom: { xs: 1, sm: 2 },
            }}
          >
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              gutterBottom
              sx={{ fontWeight: "bold", mb: isSmallScreen ? 2 : 1 }}
              align={isSmallScreen ? "center" : "left"}
            >
              All Users
            </Typography>
            <TextField
              autoComplete="off"
              fullWidth
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <List>
              {filterUsers(users).map((user) => {
                const isPending = pendingFriends.includes(user.id);
                const isAccepted = acceptedFriends.includes(user.id);
                return (
                  <ListItem key={user.id} divider>
                    {isSmallScreen ? (
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          py: 2,
                        }}
                      >
                        <Avatar
                          src={user.account.profile_picture || no_profile_photo}
                          alt={`${user.first_name} ${user.last_name}`}
                          sx={{ width: 80, height: 80, mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          onClick={() =>
                            (window.location.href = `/user/@${user.username}`)
                          }
                          className="cursor-pointer"
                        >
                          {`${user.first_name} ${user.last_name}`}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {`@${user.username}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 1,
                            gap: 1,
                          }}
                        >
                          <Tooltip title="Go Chat" placement="top">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleGoChat(user.id)}
                            >
                              <ChatIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <>
                            {isPending ? (
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disabled
                              >
                                <TimerIcon fontSize="small" />
                              </Button>
                            ) : isAccepted ? (
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disabled
                              >
                                <CheckIcon fontSize="small" />
                              </Button>
                            ) : (
                              <Tooltip title="Add Friend" placement="top">
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={() => send_friend_request(user.id)}
                                >
                                  <PersonAddIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                            )}
                          </>
                          {blockedUsers.includes(user.id) ? (
                            <Tooltip title="Unblock User" placement="top">
                              <Button
                                variant="contained"
                                color="info"
                                size="small"
                                onClick={() =>
                                  openConfirmModal(
                                    "Unblock User",
                                    `Are you sure you want to unblock ${user.username}?`,
                                    "Unblock",
                                    () => unblock_user(user.id)
                                  )
                                }
                              >
                                <GppBadIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Block User" placement="top">
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="small"
                                  onClick={() =>
                                    openConfirmModal(
                                      "Block User",
                                      `Are you sure you want to block ${user.username}?`,
                                      "Block",
                                      () => block_user(user.id)
                                    )
                                  }
                                >
                                  <GppBadIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <ListItemAvatar>
                          <Avatar
                            src={
                              user.account.profile_picture || no_profile_photo
                            }
                            alt={`${user.first_name} ${user.last_name}`}
                            sx={{
                              width: 45,
                              height: 45,
                              mr: 2,
                              my: 0.5,
                              border: "1px solid var(--primary-color)",
                              borderRadius: "50%",
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.first_name} ${user.last_name}`}
                          secondary={`@${user.username}`}
                          onClick={() =>
                            (window.location.href = `/user/@${user.username}`)
                          }
                          className="cursor-pointer"
                        />
                        <Box display="flex" alignItems="center">
                          <Tooltip title="Go Chat" placement="top">
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ mr: 1 }}
                              onClick={() => handleGoChat(user.id)}
                            >
                              <ChatIcon />
                            </Button>
                          </Tooltip>

                          {isPending ? (
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ mr: 1 }}
                              disabled
                            >
                              <TimerIcon />
                            </Button>
                          ) : isAccepted ? (
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ mr: 1 }}
                              disabled
                            >
                              <CheckIcon />
                            </Button>
                          ) : (
                            <Tooltip title="Add Friend" placement="top">
                              <Button
                                variant="contained"
                                color="success"
                                sx={{ mr: 1 }}
                                onClick={() => send_friend_request(user.id)}
                              >
                                <PersonAddIcon />
                              </Button>
                            </Tooltip>
                          )}
                          {blockedUsers.includes(user.id) ? (
                            <Tooltip title="Unblock User" placement="top">
                              <Button
                                variant="contained"
                                color="info"
                                sx={{ marginRight: 1 }}
                                onClick={() =>
                                  openConfirmModal(
                                    "Unblock User",
                                    `Are you sure you want to unblock ${user.username}?`,
                                    "Unblock",
                                    () => unblock_user(user.id)
                                  )
                                }
                              >
                                <GppBadIcon />
                              </Button>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Block User" placement="top">
                                <Button
                                  variant="contained"
                                  color="warning"
                                  sx={{ marginRight: 1 }}
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
                            </>
                          )}
                        </Box>
                      </>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
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

export default AllUsers;
