import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  keyframes,
  styled,
} from "@mui/material";

interface ChangeRoomNameModalProps {
  open: boolean;
  roomId: string;
  currentName?: string;
  onClose: () => void;
  onRoomNameChange: (roomId: string, newName: string) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.16)",
    minWidth: "400px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "90vw",
      margin: "8px",
    },
  },
}));

const PrimaryButton = styled(Button)(() => ({
  backgroundColor: "#00ff00",
  color: "#000",
  fontWeight: 700,
  borderRadius: "12px",
  padding: "12px 24px",
  "&:hover": {
    backgroundColor: "#00cc00",
    boxShadow: "0px 4px 12px rgba(0, 255, 0, 0.3)",
  },
  "&:disabled": {
    backgroundColor: "#e0e0e0",
    color: "#a0a0a0",
  },
}));

const SecondaryButton = styled(Button)(() => ({
  border: "2px solid #2d2d2d",
  color: "#2d2d2d",
  borderRadius: "12px",
  padding: "12px 24px",
  "&:hover": {
    borderColor: "#00ff00",
    color: "#00ff00",
    backgroundColor: "rgba(0, 255, 0, 0.05)",
  },
}));

const ChangeRoomNameModal: React.FC<ChangeRoomNameModalProps> = ({
  open,
  roomId,
  currentName,
  onClose,
  onRoomNameChange,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setNewName(currentName);
      setError("");
    }
  }, [open, currentName]);

  const handleSave = () => {
    const trimmedName = newName?.trim() || "";
    if (!trimmedName) {
      setError("Room name cannot be empty");
      return;
    }
    if (trimmedName === currentName?.trim()) {
      setError("Please enter a new room name");
      return;
    }
    if (trimmedName.length > 30) {
      setError("Room name cannot exceed 30 characters");
      return;
    }
    onRoomNameChange(roomId, trimmedName);
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="change-room-name-dialog-title"
      sx={{
        animation: `${fadeIn} 0.3s ease`,
      }}
    >
      <DialogTitle
        id="change-room-name-dialog-title"
        sx={{
          bgcolor: "#00ff00",
          color: "#000",
          fontWeight: "bold",
          fontSize: "1.5rem",
          borderTopLeftRadius: "14px",
          borderTopRightRadius: "14px",
          py: 2,
        }}
      >
        Change Room Name
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, mt: 2 }}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            minWidth: { xs: "250px", sm: "350px" },
          }}
        >
          <TextField
            variant="outlined"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError("");
            }}
            error={!!error}
            helperText={error || " "}
            FormHelperTextProps={{
              sx: { position: "absolute", bottom: "-22px" },
            }}
            InputProps={{
              sx: {
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#00ff00!important" },
                "&.Mui-focused fieldset": { borderColor: "#00ff00!important" },
              },
            }}
            inputProps={{
              maxLength: 30,
              style: {
                fontSize: "1.1rem",
                padding: "12px 14px",
              },
            }}
            autoFocus
            fullWidth
          />

          <Box
            sx={{
              textAlign: "right",
              fontSize: "0.8rem",
              color: error ? "#ff4444" : "#707070",
              mt: 1,
            }}
          >
            {newName?.length || 0}/30 characters
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 0.5 }}>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={handleSave}
          disabled={!!error || newName?.trim() === currentName?.trim()}
        >
          Save Changes
        </PrimaryButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ChangeRoomNameModal;
