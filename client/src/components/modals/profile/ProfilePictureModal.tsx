import React, { useState } from "react";
import { Box, Typography, Button, Modal } from "@mui/material";

interface ProfilePictureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

const ProfilePictureModal = ({ open, onClose, onSubmit }: ProfilePictureModalProps) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
      onClose();
    } else {
      alert("Please select a file first!");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="profile-picture-modal"
      aria-describedby="modal-to-upload-profile-picture"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Change Profile Picture
        </Typography>
        <input
          type="file"
          accept="image/*"
          name="profile_picture"
          onChange={handleFileChange}
          style={{ marginBottom: "16px" }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfilePictureModal;
