import React, { useState } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ProfilePictureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Dropzone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  border: "2px dashed #ccc",
  backgroundColor: theme.palette.grey[100],
  cursor: "pointer",
  transition: "0.3s",
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
}));

const ProfilePictureModal = ({ open, onClose, onSubmit }: ProfilePictureModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
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
    <Modal open={open} onClose={onClose} aria-labelledby="profile-picture-modal">
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
        <Dropzone
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Typography variant="body1" color="textSecondary">
            {selectedFile ? selectedFile.name : "Drag & drop an image here or click to upload"}
          </Typography>
          <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ mt: 2 }}>
            Upload File
            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
          </Button>
        </Dropzone>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!selectedFile}>Submit</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfilePictureModal;
