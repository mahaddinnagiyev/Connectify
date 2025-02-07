import React, { useState } from "react";
import { Box, Typography, TextField, Avatar } from "@mui/material";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Tooltip from "@mui/material/Tooltip";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import ImageModal from "../modals/ImageModal";

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: string;
  account: {
    bio: string;
    location: string;
    profile_picture: string;
    social_links: { name: string; link: string }[];
    last_login: Date;
  };
}

interface ProfileInfoProps {
  user: UserProfile;
  gender: string;
  setGender: (value: string) => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const copy_soical_link = (link: string) => {
    try {
      navigator.clipboard.writeText(link);
      setSuccessMessage("Link copied to clipboard");
    } catch (error) {
        console.log(error);
      setErrorMessage("Something went wrong - Link copy failed");
    }
  };

  const handleImageClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

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

      <Box>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            paddingLeft: 2,
            paddingTop: 2,
            mb: 4,
          }}
        >
          <Avatar
            alt={`${user.firstName} ${user.lastName}`}
            src={user.account.profile_picture}
            sx={{
              width: "150px",
              height: "150px",
              mb: 2,
              border: "2px solid #00ff00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={handleImageClick}
          />
          <Typography variant="h6">
            <button className="text-white text-sm bg-[#00ff00] px-2 py-1 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300">
              Change profile photo
            </button>
          </Typography>
        </Box>
        <h1 className="text-2xl font-bold px-2 mt-5 mb-4">
          Personal Information
        </h1>
        <hr className="border-t-2 pb-4 ml-2 mr-64" />
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "50ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              id="firstName"
              label="First Name"
              defaultValue={user.firstName}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="lastName"
              label="Last Name"
              defaultValue={user.lastName}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="username"
              label="Username"
              defaultValue={user.username}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="email"
              label="Email"
              defaultValue={user.email}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="gender"
              label="Gender"
              defaultValue={user.gender}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="px-2 py-2">
            <button className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300">
              Edit personal informations
            </button>
          </div>
        </Box>

        <h1 className="text-2xl font-bold px-2 mt-12 mb-4">
          Profile Information
        </h1>
        <hr className="border-t-2 pb-4 ml-2 mr-64" />
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "50ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              id="bio"
              label="Bio"
              defaultValue={user.account.bio}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="location"
              label="Location"
              defaultValue={user.account.location}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="last_login"
              label="Last login"
              defaultValue={`${user.account.last_login.getFullYear()}-${
                user.account.last_login.getUTCMonth() + 1
              }-${user.account.last_login.getDate()} at ${user.account.last_login.getHours()}:${user.account.last_login.getMinutes()}`}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <div className="px-2 py-2">
              <button className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300">
                Edit profile informations
              </button>
            </div>
          </div>
          <h1 className="text-xl font-bold px-2 mt-12 mb-4">Social Links</h1>
          <hr className="border-t-2 pb-4 ml-2 mr-64" />
          {user.account.social_links.map((link) => (
            <div key={link.name} className="flex items-center gap-2">
              <TextField
                id={link.name}
                label={link.name}
                defaultValue={link.link}
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
            </div>
          ))}
          <div>
            <button
              className="border-2 text-sm border-[#00ff00] text-[#00ff00] px-3 py-2 rounded ml-2"
            >
              + Add Social Link
            </button>
          </div>
        </Box>

        {/* Modals*/}
        <ImageModal
          open={modalOpen}
          onClose={handleModalClose}
          imageUrl={user.account.profile_picture}
        />
      </Box>
    </>
  );
};

export default ProfileInfo;
