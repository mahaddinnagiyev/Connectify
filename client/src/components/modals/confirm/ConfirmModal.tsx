import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  color: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
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
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
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
          borderRadius: 2,
          boxShadow: theme.shadows[5],
        },
      }}
    >
      <StyledDialogTitle id="confirm-dialog-title">
        {title}
        <IconButton onClick={onCancel} size="small" sx={{ color: theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent dividers>
        <DialogContentText
          id="confirm-dialog-description"
          sx={{ fontSize: "1rem", lineHeight: 1.5 }}
        >
          {message}
        </DialogContentText>
      </StyledDialogContent>
      <StyledDialogActions sx={{ paddingY: 1 }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color={color}>
          {confirmText}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
