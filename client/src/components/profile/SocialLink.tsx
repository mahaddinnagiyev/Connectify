import React, { useEffect, useState } from "react";
import { TextField, Tooltip } from "@mui/material";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EditIcon from "@mui/icons-material/Edit";
import SocialModal from "../modals/SocialModal";
import {
  add_social_link,
  delete_social_link,
  edit_social_link,
} from "../../services/account/social-links-service";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";

interface SocialLinkProps {
  socialLinks: { id: string; name: string; link: string }[];
  copy_soical_link: (link: string) => void;
}

const SocialLink: React.FC<SocialLinkProps> = ({
  socialLinks,
  copy_soical_link,
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

  const handleSubmit = async (formData: { name: string; link: string }) => {
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
  };

  const handleDelete = async (id: string) => {
    const response = await delete_social_link(id);
    if (response.success) {
      localStorage.setItem(
        "successMessage",
        "Social link deleted successfully!"
      );
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
            <Tooltip title="Edit Link" placement="top">
              <EditIcon
                className="cursor-pointer hover:text-orange-600 transition-all duration-300"
                onClick={() => handleEdit(link)}
              />
            </Tooltip>
            <Tooltip title="Remove Link" placement="top">
              <HighlightOffIcon
                onClick={() => handleDelete(link.id)}
                className="cursor-pointer hover:text-red-600 transition-all duration-300"
              />
            </Tooltip>
          </div>
        ))
      )}
      <div className="max-w-[146px] cursor-pointer">
        <p
          className="border-2 text-sm border-[#00ff00] text-[#00ff00] px-3 py-2 rounded ml-2"
          onClick={handleOpenModal}
        >
          + Add Social Link
        </p>
      </div>

      <SocialModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editMode={editMode}
        currentLink={currentLink}
      />
    </>
  );
};

export default SocialLink;
