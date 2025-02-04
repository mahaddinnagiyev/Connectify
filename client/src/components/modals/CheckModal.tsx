import React from "react";
import "./check-modal.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const CheckModal = () => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Circular Progress Spinner */}
          <CircularProgress size={50} sx={{ color: "#00ff00" }} />
        </Box>
        <p className="mt-5">Checking...</p>
      </div>
    </div>
  );
};

export default CheckModal;
