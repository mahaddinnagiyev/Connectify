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
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
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
    <Box sx={{ width: "100%", padding: 2, paddingTop: 0 }}>
      <Typography variant="h4" gutterBottom>
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
              <ListItemAvatar>
                <Avatar
                  src={friend.profile_picture ?? no_profile_photo}
                  alt={`${friend.first_name} ${friend.last_name}`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${friend.first_name} ${friend.last_name}`}
                secondary={`@${friend.username}`}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Go Chat" placement="top">
                  <Button
                    variant="contained"
                    sx={{
                      marginRight: 1,
                      backgroundColor: "var(--primary-color)",
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
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1">No friends found.</Typography>
      )}
    </Box>
  );
};

export default FriendList;
