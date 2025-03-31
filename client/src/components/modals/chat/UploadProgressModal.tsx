import React from "react";
import { CircularProgress, Paper, Slide } from "@mui/material";

interface UploadProgressModalProps {
  open: boolean;
}

const UploadProgressModal: React.FC<UploadProgressModalProps> = ({ open }) => {
  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          padding: 16,
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <CircularProgress size={24} style={{ color: "var(--primary-color)" }}/>
        <span>Uploading...</span>
      </Paper>
    </Slide>
  );
};

export default UploadProgressModal;
