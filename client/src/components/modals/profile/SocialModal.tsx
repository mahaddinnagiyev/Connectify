import React, { useState, useEffect } from "react";
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
  onSubmit: (formData: { name: string; link: string }) => Promise<void>;
  editMode: boolean;
  currentLink: { id: string; name: string; link: string } | null;
}

const SocialModal: React.FC<SocialModalProps> = ({
  open,
  onClose,
  onSubmit,
  editMode,
  currentLink,
}) => {
  const [formData, setFormData] = useState({ name: "", link: "" });

  useEffect(() => {
    if (editMode && currentLink) {
      setFormData({ name: currentLink.name, link: currentLink.link });
    } else {
      setFormData({ name: "", link: "" });
    }
  }, [editMode, currentLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose(); // Modalı bağla
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {editMode ? "Edit Social Link" : "Add Social Link"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoComplete="off"
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            margin="dense"
            id="link"
            label="Social URL"
            type="url"
            fullWidth
            variant="outlined"
            name="link"
            value={formData.link}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="warning">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SocialModal;
