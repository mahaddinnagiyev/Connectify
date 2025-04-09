import { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";
import ConfirmDeleteAccountModal from "../../modals/confirm/ConfirmDeleteAccountModal";
import FaceIDModal from "../../modals/auth/FaceIDModal";
import { User } from "../../../services/user/dto/user-dto";
import { Account } from "../../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../../services/account/dto/privacy-settings-dto";
import { remove_user_face_id } from "../../../services/auth/auth-service";
import ProgressModal from "../../modals/chat/ProgressModal";
import ConfirmModal from "../../modals/confirm/ConfirmModal";
import CryptoJS from "crypto-js";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
}

interface AccountSettingsProps {
  userData: UserProfile | null;
}

const AccountSettingsComponent = ({ userData }: AccountSettingsProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [removeFaceIdModalOpen, setRemoveFaceIdModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const openFaceModal = () => setFaceModalOpen(true);
  const closeFaceModal = () => setFaceModalOpen(false);

  const openRemoveFaceIDModal = () => setRemoveFaceIdModalOpen(true);
  const closeRemoveFaceIDModal = () => setRemoveFaceIdModalOpen(false);

  const removeFaceID = async () => {
    try {
      setIsRemoving(true);
      closeRemoveFaceIDModal();

      const response = await remove_user_face_id();

      if (response.success) {
        setSuccessMessage(response.message ?? "Face ID removed successfully.");

        const cacheKey = `connectify_settings`;
        const encryptionKey = process.env.VITE_CRYPTO_SECRET_KEY;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const { userId: cachedUserId, settings: encryptedSettings } =
            JSON.parse(cachedData);
          if (cachedUserId === userData?.user.id) {
            const bytes = CryptoJS.AES.decrypt(
              encryptedSettings,
              encryptionKey!
            );
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

            if (decryptedData.user) {
              decryptedData.user.face_descriptor = null;
            }

            const newEncryptedSettings = CryptoJS.AES.encrypt(
              JSON.stringify(decryptedData),
              encryptionKey!
            ).toString();

            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                userId: userData?.user.id,
                settings: newEncryptedSettings,
              })
            );
          }
        }

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage(
          response.response?.message ??
            response.response?.error ??
            response.message ??
            response.error ??
            "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      if (error) {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsRemoving(false);
    }
  };

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

      {/* Əgər üz descriptor qeyd olunmayıbsa xəbərdarlıq */}
      {userData && !userData?.user.face_descriptor && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            px: 2,
            width: "100%",
            mb: 2,
            backgroundColor: "#2196F3",
            color: "white",
            p: 2,
            borderRadius: 2,
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: { xs: "14px" } }}>
            You haven't set up a Face ID yet. Click button to add Face ID.
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>
            <button
              className="border-[3px] border-white rounded-md p-2 hover:bg-white hover:text-[#2196F3] transition-colors duration-300"
              onClick={openFaceModal}
            >
              Create Face ID
            </button>
          </Typography>
        </Box>
      )}

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          display: { xs: "flex", md: "block" },
          justifyContent: "center",
          textAlign: { xs: "center", sm: "left" },
          pl: { md: "15px" },
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
          gap: 1,
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
          <Typography>
            Face ID
            {userData && userData?.user.face_descriptor && (
              <span className="text-[var(--primary-color)] font-bold">
                : Enabled
              </span>
            )}
          </Typography>
          {userData ? (
            <>
              {userData && userData?.user.face_descriptor ? (
                <button
                  type="button"
                  onClick={openRemoveFaceIDModal}
                  className="remove-account-btn"
                >
                  Remove Face ID
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openFaceModal}
                  className="face-id-btn"
                >
                  Add Face ID
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="face-id-btn cursor-not-allowed"
              disabled
            >
              Face ID
            </button>
          )}
        </Box>
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
            onClick={() => setDeleteModalOpen(true)}
            className="remove-account-btn"
          >
            Remove Account
          </button>
        </Box>
      </Box>

      {isRemoving && (
        <ProgressModal open={isRemoving} text="Removing Face ID" />
      )}

      {faceModalOpen && (
        <FaceIDModal
          onClose={closeFaceModal}
          onSuccess={(msg) => setSuccessMessage(msg)}
          mode="register"
        />
      )}

      {removeFaceIdModalOpen && (
        <ConfirmModal
          open={removeFaceIdModalOpen}
          title="Remove Face ID"
          message="Are you sure you want to remove Face ID?"
          color="error"
          confirmText="Remove"
          onConfirm={removeFaceID}
          onCancel={closeRemoveFaceIDModal}
        />
      )}

      <ConfirmDeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
    </Box>
  );
};

export default AccountSettingsComponent;
