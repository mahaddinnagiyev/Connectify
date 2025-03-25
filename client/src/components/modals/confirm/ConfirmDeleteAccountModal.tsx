import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { delete_account } from "../../../services/auth/auth-service";
import CheckModal from "../spinner/CheckModal";

interface ConfirmDeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

const ConfirmDeleteAccountModal: React.FC<ConfirmDeleteAccountModalProps> = ({
  open,
  onClose,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const response = await delete_account();
      if (response.success) {
        setSuccessMessage(
          response.message ||
            "Account delete request has been sent to your email"
        );
      } else {
        setErrorMessage(
          response.response?.message ||
            response.response?.error ||
            response.message ||
            response.error ||
            "Failed to delete account"
        );
      }
    } catch (error) {
      if (error) {
        setErrorMessage("Failed to delete account");
      }
    } finally {
      setLoading(false);
    }
    onClose();
  };

  return (
    <>
      {loading && (
        <CheckModal message="Processing. This may take a few seconds." />
      )}
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: 3,
            maxWidth: "400px",
            margin: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "error.main",
            fontSize: "1.25rem",
          }}
        >
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1">
            Are you sure you want to remove your account? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              width: "120px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              textTransform: "none",
              width: "150px",
              backgroundColor: "error.main",
              "&:hover": { backgroundColor: "error.dark" },
            }}
          >
            Remove Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmDeleteAccountModal;
