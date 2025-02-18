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
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  block_and_unblock_user,
  get_block_list,
} from "../../../services/user/block-list-service";
import {
  BlockAction,
  BlockListDTO,
} from "../../../services/user/dto/block-list-dto";
import no_profile_photo from "../../../assets/no-profile-photo.png";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ConfirmModal from "../../modals/confirm/ConfirmModal";
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";

const BlockList = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [blockList, setBlockList] = useState<BlockListDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchBlockList = async () => {
      try {
        const response = await get_block_list();
        if (response.success) {
          setBlockList(response.blockList);
        }
      } catch (error) {
        console.error("Error fetching block list:", error);
        localStorage.setItem("errorMessage", "Failed to fetch block list.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlockList();
  }, []);

  const unblock_user = async (id: string) => {
    try {
      const response = await block_and_unblock_user(id, BlockAction.unblock);
      if (response.success) {
        localStorage.setItem("successMessage", response.message);
        window.location.reload();
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
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      localStorage.setItem("errorMessage", "Failed to unblock user.");
      window.location.reload();
    }
  };

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

  const handleConfirm = async () => {
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
          align={isSmallScreen ? "center" : "left"}
          sx={{ fontWeight: "bold" }}
        >
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
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        openConfirmModal(
                          "Confirm Unblock",
                          `Are you sure you want to unblock ${blockedUser.username}?`,
                          () => unblock_user(blockedUser.id)
                        )
                      }
                    >
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

        <ConfirmModal
          open={confirmModalOpen}
          title={confirmModalTitle}
          message={confirmModalMessage}
          color="error"
          confirmText="Unblock"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Box>
    </>
  );
};

export default BlockList;
