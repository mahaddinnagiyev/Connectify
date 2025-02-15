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
  getFriendRequests
} from "../../../services/friendship/friendship-service";
import {
  FriendshipRecieveRequestDTO,
  FriendshipSentRequestDTO,
} from "../../../services/friendship/dto/friendship-dto";
import { styled } from "@mui/material/styles";
import no_profile_photo from "../../../assets/no-profile-photo.png";

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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "received" | "sent" | null
  ) => {
    if (newFilter !== null) {
      setActiveFilter(newFilter);
    }
  };

  const renderReceivedRequests = () => {
    if (receivedRequests.length === 0) {
      return (
        <Typography variant="body1">No received friend requests.</Typography>
      );
    }
    return (
      <List>
        {receivedRequests.map((req) => {
          const fullName = `${req.requester.first_name} ${req.requester.last_name}`;
          return (
            <React.Fragment key={req.id}>
              <ListItem alignItems="center">
                <ListItemAvatar>
                  <Avatar
                    src={req.requester.profile_picture ?? no_profile_photo}
                    alt="user profile picture"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={fullName}
                  secondary={`@${req.requester.username}`}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: "var(--primary-color)", fontWeight: 600 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: "red", borderColor: "red", fontWeight: 600 }}
                  >
                    Reject
                  </Button>
                </Stack>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return <Typography variant="body1">No sent friend requests.</Typography>;
    }
    return (
      <List>
        {sentRequests.map((req) => {
          const fullName = `${req.requestee.first_name} ${req.requestee.last_name}`;
          return (
            <React.Fragment key={req.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar
                    src={req.requestee.profile_picture ?? no_profile_photo}
                    alt="user profile picture"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={fullName}
                  secondary={`@${req.requestee.username}`}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
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
    </Box>
  );
};

export default FriendRequests;
