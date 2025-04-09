import React, { useEffect, useState } from "react";
import {
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  InsertLink as InsertLinkIcon,
  OpenInNew as OpenInNewIcon,
  HighlightOff as HighlightOffIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import SocialModal from "../modals/profile/SocialModal";
import {
  add_social_link,
  delete_social_link,
  edit_social_link,
} from "../../services/account/social-links-service";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import {
  PrivacySettings,
  PrivacySettingsDTO,
} from "../../services/account/dto/privacy-settings-dto";
import ProgressModal from "../modals/chat/ProgressModal";
import CryptoJS from "crypto-js";
import { SocialLink as SocialLinkDTO } from "../../services/account/dto/social-link-dto";

interface SocialLinkProps {
  socialLinks: { id: string; name: string; link: string }[];
  copy_soical_link: (link: string) => void;
  privacy_settings: PrivacySettingsDTO | null;
  accepted: boolean;
  userId: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({
  userId,
  socialLinks,
  copy_soical_link,
  privacy_settings,
  accepted,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLink, setCurrentLink] = useState<{
    id: string;
    name: string;
    link: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getUrl = (params: string): boolean => {
    return window.location.href.includes(params);
  };

  const handleOpenModal = () => {
    setEditMode(false);
    setCurrentLink(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEdit = (link: { id: string; name: string; link: string }) => {
    setEditMode(true);
    setCurrentLink(link);
    setOpenModal(true);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (formData: { name: string; link: string }) => {
    try {
      setIsProcessing(true);

      if (!isValidUrl(formData.link)) {
        return setErrorMessage("Please enter valid URL");
      }

      handleCloseModal();

      let response;
      if (editMode && currentLink) {
        response = await edit_social_link(currentLink.id, formData);
      } else {
        response = await add_social_link(formData);
      }

      if (response.success) {
        localStorage.setItem(
          "successMessage",
          editMode
            ? "Social link updated successfully!"
            : "Social link added successfully!"
        );

        if (editMode && currentLink) {
          const cacheKey = `connectify_profile`;
          const encryptionKey = process.env.VITE_CRYPTO_SECRET_KEY;
          const cachedData = localStorage.getItem(cacheKey);

          if (cachedData) {
            const { userId: cachedUserId, profile: encryptedProfile } =
              JSON.parse(cachedData);
            if (cachedUserId === userId) {
              const bytes = CryptoJS.AES.decrypt(
                encryptedProfile,
                encryptionKey!
              );
              const decryptedData = JSON.parse(
                bytes.toString(CryptoJS.enc.Utf8)
              );

              const targetLink = decryptedData.account.social_links.find(
                (link: SocialLinkDTO) => link.id === currentLink.id
              );

              if (targetLink) {
                targetLink.name = formData.name;
                targetLink.link = formData.link;
              }

              const newEncryptedProfile = CryptoJS.AES.encrypt(
                JSON.stringify(decryptedData),
                encryptionKey!
              ).toString();

              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  userId,
                  profile: newEncryptedProfile,
                })
              );
            }
          }
        }

        window.location.reload();
      } else {
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error ??
              response.message ??
              response.error ??
              "Invalid social link"
          );
        }
      }
    } catch (error) {
      if (error) {
        setErrorMessage(
          editMode
            ? "Failed to update social link"
            : "Failed to add social link"
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (linkToDelete) {
        handleCloseConfirmDialog();

        const response = await delete_social_link(linkToDelete);
        if (response.success) {
          localStorage.setItem(
            "successMessage",
            "Social link deleted successfully!"
          );

          const cacheKey = `connectify_profile`;
          const encryptionKey = process.env.VITE_CRYPTO_SECRET_KEY;
          const cachedData = localStorage.getItem(cacheKey);

          if (cachedData) {
            const { userId: cachedUserId, profile: encryptedProfile } =
              JSON.parse(cachedData);
            if (cachedUserId === userId) {
              const bytes = CryptoJS.AES.decrypt(
                encryptedProfile,
                encryptionKey!
              );
              const decryptedData = JSON.parse(
                bytes.toString(CryptoJS.enc.Utf8)
              );

              decryptedData.account.social_links =
                decryptedData.account.social_links.filter(
                  (link: SocialLinkDTO) => link.id !== linkToDelete
                );

              const newEncryptedProfile = CryptoJS.AES.encrypt(
                JSON.stringify(decryptedData),
                encryptionKey!
              ).toString();

              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  userId,
                  profile: newEncryptedProfile,
                })
              );
            }
          }

          window.location.reload();
        } else {
          if (Array.isArray(response.message)) {
            setErrorMessage(response.message[0]);
          } else {
            setErrorMessage(
              response.response?.error ??
                response.message ??
                response.error ??
                "Invalid social link"
            );
          }
        }
      }
    } catch (error) {
      if (error) {
        setErrorMessage("Failed to delete social link");
      }
    } finally {
      setIsDeleting(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleOpenConfirmDialog = (id: string) => {
    setLinkToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setLinkToDelete(null);
  };

  useEffect(() => {
    const successMessage = localStorage.getItem("successMessage");
    if (successMessage) {
      setSuccessMessage(successMessage);
      localStorage.removeItem("successMessage");
    }
  }, []);

  return (
    <>
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

      <h1 className="text-xl font-bold px-2 mt-12 mb-4">Social Links</h1>
      <hr className="border-t-2 pb-4 ml-2 sm:mr-64 mr-0" />
      {socialLinks.length === 0 ? (
        <h5 className="ml-2 mb-4 font-sans">There is no social media link</h5>
      ) : (
        socialLinks.map((link) => (
          <div key={link.name} className="flex items-center gap-2">
            {getUrl("my-profile") ||
            privacy_settings?.social_links === PrivacySettings.everyone ? (
              <>
                <TextField
                  autoComplete="off"
                  id={link.id}
                  label={link.name}
                  value={link.link}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy link" placement="top">
                  <InsertLinkIcon
                    className="cursor-pointer"
                    style={{ fontSize: "30px" }}
                    onClick={() => copy_soical_link(link.link)}
                  />
                </Tooltip>
                <Tooltip title="Open link in new tab" placement="top">
                  <OpenInNewIcon
                    className="cursor-pointer"
                    style={{ fontSize: "24px" }}
                    onClick={() => window.open(link.link, "_blank")}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                {privacy_settings?.social_links ===
                  PrivacySettings.my_friends && accepted ? (
                  <>
                    <TextField
                      id={link.id}
                      label={link.name}
                      value={link.link}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <Tooltip title="Copy link" placement="top">
                      <InsertLinkIcon
                        className="cursor-pointer"
                        style={{ fontSize: "30px" }}
                        onClick={() => copy_soical_link(link.link)}
                      />
                    </Tooltip>
                    <Tooltip title="Open link in new tab" placement="top">
                      <OpenInNewIcon
                        className="cursor-pointer"
                        style={{ fontSize: "24px" }}
                        onClick={() => window.open(link.link, "_blank")}
                      />
                    </Tooltip>
                  </>
                ) : (
                  ""
                )}
              </>
            )}
            {getUrl("my-profile") && (
              <>
                <Tooltip title="Edit Link" placement="top">
                  <EditIcon
                    className="cursor-pointer hover:text-orange-600 transition-all duration-300"
                    onClick={() => handleEdit(link)}
                  />
                </Tooltip>
                <Tooltip title="Remove Link" placement="top">
                  <HighlightOffIcon
                    onClick={() => handleOpenConfirmDialog(link.id)}
                    className="cursor-pointer hover:text-red-600 transition-all duration-300"
                  />
                </Tooltip>
              </>
            )}
          </div>
        ))
      )}
      {getUrl("my-profile") && (
        <div className="max-w-[146px] cursor-pointer">
          <p
            className="border-2 text-sm border-[#00ff00] text-[#00ff00] px-3 py-2 rounded ml-2"
            onClick={handleOpenModal}
          >
            + Add Social Link
          </p>
        </div>
      )}

      {getUrl("my-profile") && (
        <>
          {/* Social Modal */}
          <SocialModal
            open={openModal}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            editMode={editMode}
            currentLink={currentLink}
          />

          {/* Confirmation Dialog */}
          <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this social link?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirmDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDelete} sx={{ color: "red" }}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {isDeleting && <ProgressModal open={isDeleting} text="Removing..." />}
      {isProcessing && (
        <ProgressModal
          open={isProcessing}
          text={`${editMode ? "Updating..." : "Creating..."}`}
        />
      )}
    </>
  );
};

export default SocialLink;
