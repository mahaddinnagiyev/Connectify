import { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import ImageModal from "../modals/profile/ImageModal";
import { getUserById, edit_user } from "../../services/user/user-service"; // Import edit_user
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import no_profile_photo from "../../assets/no-profile-photo.png";
import ProfileEditModal from "../modals/profile/ProfileEditModal";
import { Gender } from "../../services/auth/dto/singup-dto";
import PersonalInfo from "./PersonalInfo";
import AccountInfo from "./AccountInfo";
import { edit_account } from "../../services/account/account-service";

interface UserProfile {
  user: User;
  account: Account;
}

const ProfileInfo = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [editPersonalInfoModalOpen, setEditPersonalInfoModalOpen] =
    useState(false);
  const [editProfileInfoModalOpen, setEditProfileInfoModalOpen] =
    useState(false);

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

  const handleEditPersonalInfoSubmit = async (data: {
    [key: string]: string;
  }) => {
    try {
      const body = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        gender: data.gender as Gender,
      };

      const response = await edit_user(body);

      if (response.success) {
        localStorage.setItem(
          "successMessage",
          response.message ?? "Personal information updated successfully!"
        );
        window.location.reload();
      } else {
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error ||
              response.message ||
              response.error ||
              "Invalid personal information"
          );
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong - Please try again later");
    }
  };

  const handleEditProfileInfoSubmit = async (data: {
    [key: string]: string;
  }) => {
    try {
      const body = {
        bio: data.bio,
        location: data.location,
      };

      const response = await edit_account(body);

      if (response.success) {
        localStorage.setItem(
          "successMessage",
          response.message ?? "Account updated successfully!"
        );
        window.location.reload();
      } else {
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error ||
              response.message ||
              response.error ||
              "Invalid account information"
          );
        }
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Something went wrong - Please try again later");
    }
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

  useEffect(() => {
    const successMessage = localStorage.getItem("successMessage");
    if (successMessage) {
      setSuccessMessage(successMessage);
      localStorage.removeItem("successMessage");
    }
  }, [userData]);

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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            display: { xs: "flex", md: "block" },
            justifyContent: "center",
            textAlign: { xs: "center", sm: "left" },
            paddingLeft: { md: "20px" },
          }}
        >
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
        {/* Personal Information Section */}
        <PersonalInfo
          userData={userData}
          onEdit={() => setEditPersonalInfoModalOpen(true)}
        />
        {/* Account Information Section */}
        <AccountInfo
          userData={userData}
          onEdit={() => setEditProfileInfoModalOpen(true)}
          copySocialLink={copy_soical_link}
        />
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
        {/* Edit Personal Information Modal */}
        <ProfileEditModal
          open={editPersonalInfoModalOpen}
          onClose={() => setEditPersonalInfoModalOpen(false)}
          title="Edit Personal Information"
          fields={[
            {
              label: "First Name",
              value: userData?.user.first_name || "",
              key: "first_name",
            },
            {
              label: "Last Name",
              value: userData?.user.last_name || "",
              key: "last_name",
            },
            {
              label: "Username",
              value: userData?.user.username || "",
              key: "username",
            },
            {
              label: "Gender",
              value: userData?.user.gender || "",
              key: "gender",
              type: "select",
              options: [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ],
            },
          ]}
          onSubmit={handleEditPersonalInfoSubmit}
          allowEmpty={false}
        />
        {/* Edit Profile Information Modal */}
        <ProfileEditModal
          open={editProfileInfoModalOpen}
          onClose={() => setEditProfileInfoModalOpen(false)}
          title="Edit Profile Information"
          fields={[
            { label: "Bio", value: userData?.account.bio || "", key: "bio" },
            {
              label: "Location",
              value: userData?.account.location || "",
              key: "location",
            },
          ]}
          onSubmit={handleEditProfileInfoSubmit}
          allowEmpty={true}
        />
      </Box>
    </>
  );
};

export default ProfileInfo;
