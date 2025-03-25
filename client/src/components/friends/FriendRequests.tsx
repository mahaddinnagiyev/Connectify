import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import {
  acceptAndRejectFriendship,
  getFriendRequests,
} from "../../services/friendship/friendship-service";
import {
  FriendshipRecieveRequestDTO,
  FriendshipSentRequestDTO,
} from "../../services/friendship/dto/friendship-dto";
import { styled } from "@mui/material/styles";
import no_profile_photo from "../../assets/no-profile-photo.png";
import { block_and_unblock_user } from "../../services/user/block-list-service";
import { BlockAction } from "../../services/user/dto/block-list-dto";
import ConfirmModal from "../modals/confirm/ConfirmModal";
import { FriendshipAction } from "../../services/friendship/enum/friendship-status.enum";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";

const FilterToggleButton = styled(ToggleButton)(({ theme }) => ({
  "&.MuiToggleButton-root": {
    borderRadius: "20px",
    border: `1px solid ${theme.palette.divider}`,
    textTransform: "none",
    padding: "6px 16px",
    transition: "all 0.3s ease",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "#e6ffe6",
      borderColor: "#00ff00",
    },
  },
  "&.Mui-selected": {
    backgroundColor: "#00ff00",
    color: "#fff",
    borderColor: "#00ff00",
    "&:hover": {
      backgroundColor: "#00cc00",
    },
    "&.Mui-focusVisible": {
      outline: "2px solid #00ff00",
    },
  },
}));

const FriendRequests: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"received" | "sent">(
    "received"
  );
  const [receivedRequests, setReceivedRequests] = useState<
    FriendshipRecieveRequestDTO[]
  >([]);
  const [sentRequests, setSentRequests] = useState<FriendshipSentRequestDTO[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const getRelativeTime = (dateString: string): string => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - createdDate.getTime();

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} weeks ago`;

    if (days >= 365) {
      return createdDate.toLocaleDateString();
    }

    const months = Math.floor(days / 30);
    return `${months} ay əvvəl`;
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await getFriendRequests();
      if (response.success) {
        setReceivedRequests(response.receivedRequests);
        setSentRequests(response.sentRequests);
      } else {
        setError(response.message ?? "Failed to fetch friend requests.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch friend requests.");
    } finally {
      setLoading(false);
    }
  };

  const block_user = async (id: string) => {
    try {
      const response = await block_and_unblock_user(id, BlockAction.block);
      if (response.success) {
        setSuccessMessage(response.message);
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
      window.location.reload();
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleFilterChange = (
    _: React.MouseEvent<HTMLElement>,
    newFilter: "received" | "sent" | null
  ) => {
    if (newFilter !== null) {
      setActiveFilter(newFilter);
    }
  };

  const acceptAndRejectRequest = async (
    status: FriendshipAction,
    id: string
  ) => {
    try {
      const response = await acceptAndRejectFriendship(status, id);

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
              "Failed to accept/reject friend request."
          );
        }
      }

      window.location.reload();
    } catch (error) {
      if (error) {
        localStorage.setItem(
          "errorMessage",
          "Failed to accept/reject friend request."
        );
        window.location.reload();
      }
    }
  };

  const sortedReceivedRequests = [...receivedRequests].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const sortedSentRequests = [...sentRequests].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const renderReceivedRequests = () => {
    if (sortedReceivedRequests.length === 0) {
      return (
        <Typography variant="body1">No received friend requests.</Typography>
      );
    }
    return (
      <List>
        {sortedReceivedRequests.map((req) => {
          const fullName = `${req.requester.first_name} ${req.requester.last_name}`;
          return (
            <React.Fragment key={req.id}>
              <ListItem
                sx={{
                  flexDirection: isSmallScreen ? "column" : "row",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: isSmallScreen ? 2 : 0,
                  }}
                >
                  <ListItemAvatar sx={{ mr: isSmallScreen ? 0 : 2 }}>
                    <Avatar
                      src={req.requester.profile_picture ?? no_profile_photo}
                      alt="user profile picture"
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={fullName}
                    secondary={`@${req.requester.username} • ${getRelativeTime(
                      String(req.created_at)
                    )}`}
                    onClick={() =>
                      (window.location.href = `/user/@${req.requester.username}`)
                    }
                    className="cursor-pointer"
                  />
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: isSmallScreen ? "center" : "flex-end",
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "var(--primary-color)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                      onClick={() =>
                        acceptAndRejectRequest(FriendshipAction.accept, req.id)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: "red",
                        borderColor: "red",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                      onClick={() =>
                        acceptAndRejectRequest(FriendshipAction.reject, req.id)
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: "red",
                        borderColor: "red",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                      onClick={() =>
                        openConfirmModal(
                          "Confirm Block",
                          `Are you sure you want to block ${req.requester.username}?`,
                          () => block_user(req.requester.id)
                        )
                      }
                    >
                      Block
                    </Button>
                  </Stack>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  const renderSentRequests = () => {
    if (sortedSentRequests.length === 0) {
      return <Typography variant="body1">No sent friend requests.</Typography>;
    }
    return (
      <List>
        {sortedSentRequests.map((req) => {
          const fullName = `${req.requestee.first_name} ${req.requestee.last_name}`;
          return (
            <React.Fragment key={req.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar
                    src={req.requestee.profile_picture ?? no_profile_photo}
                    alt="user profile picture"
                    sx={{
                      border: "1px solid var(--primary-color)",
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={fullName}
                  secondary={`@${req.requestee.username} • ${getRelativeTime(
                    String(req.created_at)
                  )}`}
                  onClick={() =>
                    (window.location.href = `/user/@${req.requestee.username}`)
                  }
                  className="cursor-pointer"
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  const openConfirmModal = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
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

      <Box sx={{ width: "100%", padding: 2, paddingTop: 0 }}>
        <Typography
          variant={isSmallScreen ? "h5" : "h4"}
          gutterBottom
          sx={{ fontWeight: "bold" }}
          align={isSmallScreen ? "center" : "left"}
        >
          Friend Requests
        </Typography>

        <ToggleButtonGroup
          value={activeFilter}
          exclusive
          onChange={handleFilterChange}
          aria-label="friend request filter"
          sx={{
            marginBottom: 3,
            display: "flex",
            justifyContent: isSmallScreen ? "center" : "flex-start",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <FilterToggleButton value="received" aria-label="received requests">
            Received ({receivedRequests.length})
          </FilterToggleButton>

          <FilterToggleButton value="sent" aria-label="sent requests">
            Sent ({sentRequests.length})
          </FilterToggleButton>
        </ToggleButtonGroup>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : activeFilter === "received" ? (
          renderReceivedRequests()
        ) : (
          renderSentRequests()
        )}

        <ConfirmModal
          open={confirmModalOpen}
          title={confirmModalTitle}
          message={confirmModalMessage}
          color="error"
          confirmText="Block"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Box>
    </>
  );
};

export default FriendRequests;
