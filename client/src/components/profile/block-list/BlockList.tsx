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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { get_block_list } from "../../../services/user/block-list-service";
import { BlockListDTO } from "../../../services/user/dto/block-list-dto";
import no_profile_photo from "../../../assets/no-profile-photo.png";
import GppGoodIcon from "@mui/icons-material/GppGood";

const BlockList = () => {
  const [blockList, setBlockList] = useState<BlockListDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Responsive üçün media query
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBlockList = async () => {
      try {
        const response = await get_block_list();
        console.log(response);
        if (response.success) {
          setBlockList(response.blockList);
        }
      } catch (error) {
        console.error("Error fetching block list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockList();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredBlockedUsers = blockList.filter((blockedUser) => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const fullName =
      `${blockedUser.first_name} ${blockedUser.last_name}`.toLowerCase();
    return (
      blockedUser.username.toLowerCase().includes(searchTerm) ||
      blockedUser.first_name.toLowerCase().includes(searchTerm) ||
      blockedUser.last_name.toLowerCase().includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });

  return (
    <Box sx={{ width: "100%", padding: 2, paddingTop: 0 }}>
      <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
        Block List
      </Typography>
      <TextField
        fullWidth
        label="Search user"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ marginBottom: 2 }}
        InputLabelProps={{
          style: { fontSize: isSmallScreen ? "0.875rem" : "1rem" },
        }}
      />
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              fontSize: isSmallScreen ? "0.875rem" : "1rem",
            }}
          >
            Loading blocked users...
          </Typography>
        </Box>
      ) : filteredBlockedUsers.length > 0 ? (
        <List>
          {filteredBlockedUsers.map((blockedUser) => (
            <ListItem key={blockedUser.id} divider>
              <ListItemAvatar>
                <Avatar
                  src={blockedUser.profile_picture ?? no_profile_photo}
                  alt={`${blockedUser.first_name} ${blockedUser.last_name}`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${blockedUser.first_name} ${blockedUser.last_name}`}
                secondary={`@${blockedUser.username}`}
                primaryTypographyProps={{
                  fontSize: isSmallScreen ? "0.9rem" : "1rem",
                }}
                secondaryTypographyProps={{
                  fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                }}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Unblock User" placement="top">
                  <Button variant="contained" color="success">
                    <GppGoodIcon />
                  </Button>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          variant="body1"
          sx={{ fontSize: isSmallScreen ? "0.875rem" : "1rem" }}
        >
          No blocked users found.
        </Typography>
      )}
    </Box>
  );
};

export default BlockList;
