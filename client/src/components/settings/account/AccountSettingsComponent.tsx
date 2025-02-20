import { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";
import ConfirmDeleteAccountModal from "../../modals/confirm/ConfirmDeleteAccountModal";

const AccountSettingsComponent = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <Box sx={{ width: "100%", padding: 0, mb: 4 }}>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          display: { xs: "flex", md: "block" },
          justifyContent: "center",
          textAlign: { xs: "center", sm: "left" },
          paddingLeft: { md: "15px" },
          fontWeight: "bold",
        }}
      >
        Account Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 2,
          width: "100%",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Remove Account</Typography>
          <button
            type="button"
            onClick={openModal}
            className="remove-account-btn"
          >
            Remove Account
          </button>
        </Box>
      </Box>

      <ConfirmDeleteAccountModal
        open={modalOpen}
        onClose={closeModal}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
    </Box>
  );
};

export default AccountSettingsComponent;
