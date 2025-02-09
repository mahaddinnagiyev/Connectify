import React from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ open, onClose, imageUrl }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 2,
          borderRadius: "8px",
          maxWidth: "450px",
          maxHeight: "450px",
          overflow: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "gray",
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
      </Box>
    </Modal>
  );
};

export default ImageModal;
