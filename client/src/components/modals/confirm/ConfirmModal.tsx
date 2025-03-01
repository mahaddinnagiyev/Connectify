import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useTheme,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  color:
    | "primary"
    | "inherit"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontWeight: "bold",
  textAlign: "center",
  color: theme.palette.error.main,
  fontSize: "1.25rem",
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  marginBottom: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
  justifyContent: "center",
  gap: 2,
}));

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  color,
  confirmText,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
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
      <StyledDialogTitle id="confirm-dialog-title">
        {title}
        <IconButton
          onClick={onCancel}
          size="small"
          sx={{ color: theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent dividers>
        <Typography variant="body1" sx={{ fontSize: "1rem", lineHeight: 1.5 }}>
          {message}
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            textTransform: "none",
            width: "120px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={color}
          sx={{
            textTransform: "none",
            width: "150px",
            backgroundColor: theme.palette.error.main,
            "&:hover": { backgroundColor: theme.palette.error.dark },
          }}
        >
          {confirmText}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
