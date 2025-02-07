import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

interface SocialModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  socialLink: { name: string; link: string };
  setSocialLink: (value: { name: string; link: string }) => void;
}

const SocialModal: React.FC<SocialModalProps> = ({
  open,
  onClose,
}) => {

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Social Link</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Social Link Name"
          type="text"
          fullWidth
          variant="outlined"
          name="name"
        />
        <TextField
          margin="dense"
          id="link"
          label="Social Link URL"
          type="url"
          fullWidth
          variant="outlined"
          name="link"
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary">
          Cancel
        </Button>
        <Button color="primary">
          Add Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SocialModal;
