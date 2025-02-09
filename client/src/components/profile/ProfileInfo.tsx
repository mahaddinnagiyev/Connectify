import { useEffect, useState } from "react";
import { Box, Typography, TextField, Avatar } from "@mui/material";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import ImageModal from "../modals/ImageModal";
import { getUserById } from "../../services/user/user-service";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import no_profile_photo from "../../assets/no-profile-photo.png";
import SocialLink from "./SocialLink";

interface UserProfile {
  user: User;
  account: Account;
}

const ProfileInfo = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    getUserById().then((response) => {
      if (response.success) {
        setUserData({
          user: response.user ?? {
            id: null,
            first_name: null,
            last_name: null,
            email: null,
            username: null,
            gender: null,
          },
          account: response.account ?? {
            id: null,
            bio: null,
            location: null,
            profile_picture: null,
            social_links: [],
          },
        });
      } else {
        setErrorMessage(
          response.response?.message ??
            response.response?.error ??
            response.message ??
            response.error ??
            "Something went wrong"
        );
      }
    });
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

      <Box sx={{ width: "100%", padding: 0 }}>
        <Typography variant="h4" gutterBottom sx={{ display: { xs: "flex", md: "block" }, justifyContent: "center", textAlign: { xs: "center", sm: "left" }, paddingLeft: { md: "20px" } }}>
          My Profile
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", sm: "center", md: "flex-start" },
            paddingLeft: 2,
            paddingTop: 2,
            mb: 4,
          }}
        >
          <Avatar
            alt={`${userData?.user.first_name || ""} ${
              userData?.user.last_name || ""
            }`}
            src={userData?.account.profile_picture || no_profile_photo}
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
        <h1 className="text-2xl font-bold sm:px-2 px-6 mt-5 mb-4">
          Personal Information
        </h1>
        <hr className="border-t-2 pb-4 sm:ml-2 ml-6 sm:mr-64 mr-0" />
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
              value={userData?.user.first_name || ""}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%", md: "50%" } }}
            />
            <TextField
              id="lastName"
              label="Last Name"
              value={userData?.user.last_name || ""}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
            <TextField
              id="username"
              label="Username"
              value={userData?.user.username || ""}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
            <TextField
              id="email"
              label="Email"
              value={userData?.user.email || ""}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
            <TextField
              id="gender"
              label="Gender"
              value={userData?.user.gender || ""}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
          </div>
          <div className="px-2 py-2">
            <button className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300">
              Edit personal information
            </button>
          </div>
        </Box>

        <h1 className="text-2xl font-bold sm:px-2 px-6 mt-12 mb-4">
          Profile Information
        </h1>
        <hr className="border-t-2 pb-4 sm:ml-2 ml-6 sm:mr-64 mr-0" />
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
              value={
                userData?.account.bio
                  ? userData.account.bio
                  : "There is no bio yet"
              }
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
            <TextField
              id="location"
              label="Location"
              value={
                userData?.account.location
                  ? userData.account.location
                  : "There is no location yet"
              }
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
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
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              value={
                userData?.account.last_login
                  ? userData.account.last_login
                  : "There is no last login yet"
              }
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
            <div className="px-2 py-2">
              <button className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300">
                Edit profile information
              </button>
            </div>
          </div>

          {/* Social Links Section */}
          <SocialLink
            socialLinks={userData?.account.social_links || []}
            copy_soical_link={copy_soical_link}
          />
        </Box>

        {/* Modals*/}
        <ImageModal
          open={modalOpen}
          onClose={handleModalClose}
          imageUrl={
            userData?.account.profile_picture
              ? userData.account.profile_picture
              : no_profile_photo
          }
        />
      </Box>
    </>
  );
};

export default ProfileInfo;
