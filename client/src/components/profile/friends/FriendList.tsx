import { useState, useEffect } from "react";
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
import { getFriends } from "../../../services/friendship/friendship-service";
import { UserFriendsDTO } from "../../../services/friendship/dto/friendship-dto";
import no_profile_photo from "../../../assets/no-profile-photo.png";

const FriendList = () => {
  const [friends, setFriends] = useState<UserFriendsDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Tema və media query ilə ekran ölçüsünü yoxlayırıq
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

  return (
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
        align="center"
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
                <>
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
                      />
                    </Box>
                    <Box display="flex" justifyContent="center" width="100%">
                      <Tooltip title="Go Chat" placement="top">
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          sx={{
                            marginRight: 1,
                          }}
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
                        >
                          <GppBadIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Remove Friend" placement="top">
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                        >
                          <PersonRemoveIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </>
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
                  />
                  <Box display="flex" alignItems="center">
                    <Tooltip title="Go Chat" placement="top">
                      <Button
                        variant="contained"
                        color="success"
                        sx={{
                          marginRight: 1,
                        }}
                      >
                        <ChatIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Block User" placement="top">
                      <Button
                        variant="contained"
                        color="warning"
                        sx={{ marginRight: 1 }}
                      >
                        <GppBadIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Remove Friend" placement="top">
                      <Button variant="contained" color="warning">
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
    </Box>
  );
};

export default FriendList;
