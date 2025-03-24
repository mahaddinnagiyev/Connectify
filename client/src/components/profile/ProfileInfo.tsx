import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Tooltip, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TimerIcon from "@mui/icons-material/Timer";
import ChatIcon from "@mui/icons-material/Chat";
import GppBadIcon from "@mui/icons-material/GppBad";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import ImageModal from "../modals/profile/ImageModal";
import ProfileEditModal from "../modals/profile/ProfileEditModal";
import { Gender } from "../../services/auth/dto/singup-dto";
import PersonalInfo from "./PersonalInfo";
import AccountInfo from "./AccountInfo";
import { edit_user } from "../../services/user/user-service";
import {
  edit_account,
  update_profile_pic,
} from "../../services/account/account-service";
import ProfilePictureModal from "../modals/profile/ProfilePictureModal";
import no_profile_photo from "../../assets/no-profile-photo.png";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import {
  getAllFriendshipRequests,
  removeFriendship,
  sendFriendshipRequest,
} from "../../services/friendship/friendship-service";
import {
  block_and_unblock_user,
  get_block_list,
} from "../../services/user/block-list-service";
import {
  BlockAction,
  BlockListDTO,
} from "../../services/user/dto/block-list-dto";
import { UserFriendsDTO } from "../../services/friendship/dto/friendship-dto";
import { FriendshipStatus } from "../../services/friendship/enum/friendship-status.enum";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket/socket-service";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
}

interface ProfileInfoProps {
  userData: UserProfile | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ userData }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPersonalInfoModalOpen, setEditPersonalInfoModalOpen] =
    useState(false);
  const [editProfileInfoModalOpen, setEditProfileInfoModalOpen] =
    useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);

  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const navigate = useNavigate();

  const getUrl = (params: string): boolean => {
    return window.location.href.includes(params);
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const copy_soical_link = (link: string) => {
    try {
      navigator.clipboard.writeText(link);
      setSuccessMessage("Link copied to clipboard");
    } catch (error) {
      if (error) {
        setErrorMessage("Something went wrong - Link copy failed");
      }
    }
  };

  const handleImageClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const fetchBlockedUsers = async () => {
    try {
      const result = await get_block_list();
      if (result.success) {
        const blocked = result.blockList.map(
          (item: BlockListDTO) => item.blocked_id
        );
        setBlockedUsers(blocked);
      }
    } catch (error) {
      console.error("Failed to fetch block list:", error);
    }
  };

  const handleGoChat = (userId: string) => {
    socket?.emit("joinRoom", { user2Id: userId });
    socket?.once("joinRoomSuccess", (data: { roomId: string }) => {
      if (data && data.roomId) {
        navigate(`/messenger?room=${data.roomId}`);
      }
    });
  };

  const handleProfilePictureChange = async (file: File) => {
    try {
      const response = await update_profile_pic(file);
      if (response.success) {
        localStorage.setItem(
          "successMessage",
          response.message || "Profile picture updated successfully!"
        );
        window.location.reload();
      } else {
        if (Array.isArray(response.message)) {
          setErrorMessage(response.message[0]);
        } else {
          setErrorMessage(
            response.response?.error &&
              response.response?.error === "Image upload failed"
              ? "Image upload failed please check if image type is correct"
              : response.response?.error ||
                  response.message ||
                  response.error ||
                  "Invalid personal information"
          );
        }
      }
    } catch (error) {
      if (error) {
        setErrorMessage("Something went wrong - Please try again later");
      }
    }
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
      if (error) {
        setErrorMessage("Something went wrong - Please try again later");
      }
    }
  };

  useEffect(() => {
    if (!getUrl("my-profile") && userData) {
      const fetchFriendshipStatus = async () => {
        try {
          const response = await getAllFriendshipRequests();
          if (response.success) {
            const acceptedFriends = response.friends
              .filter((friend: UserFriendsDTO) => friend.status === "accepted")
              .map((friend: UserFriendsDTO) => friend.friend_id);
            const pendingFriends = response.friends
              .filter(
                (friend: UserFriendsDTO) =>
                  friend.status === FriendshipStatus.pending
              )
              .map((friend: UserFriendsDTO) => friend.friend_id);
            setAccepted(acceptedFriends.includes(userData.user.id));
            setPending(pendingFriends.includes(userData.user.id));
          }
        } catch (error) {
          console.error("Error fetching friendship status:", error);
        }
      };
      fetchFriendshipStatus();
    }
  }, [userData]);

  const send_friend_request = async () => {
    if (!userData) return;
    try {
      const response = await sendFriendshipRequest(userData.user.id);
      if (response.success) {
        setSuccessMessage(response.message);
        setPending(true);
      } else {
        setErrorMessage(
          response.response?.error ??
            response.response?.message ??
            response.message ??
            response.error ??
            "Failed to send friend request"
        );
      }
    } catch (error) {
      setErrorMessage("Failed to send friend request");
      console.error("Failed to send friend request:", error);
    }
  };

  const block_user = async () => {
    if (!userData) return;
    try {
      const response = await block_and_unblock_user(
        userData.user.id,
        BlockAction.block
      );
      if (response.success) {
        setSuccessMessage("User blocked successfully");
      }
    } catch (error) {
      console.error("Failed to block user:", error);
      setErrorMessage("Failed to block user");
    }
  };

  const unblock_user = async (id: string) => {
    try {
      const response = await block_and_unblock_user(id, BlockAction.unblock);
      if (response.success) {
        localStorage.setItem("successMessage", response.message);
      } else {
        if (Array.isArray(response.message)) {
          localStorage.setItem("errorMessage", response.message[0]);
        } else {
          localStorage.setItem(
            "errorMessage",
            response.response?.error ??
              response.message ??
              response.error ??
              "Failed to unblock user."
          );
        }
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      localStorage.setItem("errorMessage", "Failed to unblock user.");
    }
  };

  const remove_friend = async (id: string) => {
    try {
      const response = await removeFriendship(id);
      if (response.success) {
        localStorage.setItem("successMessage", response.message);
      } else {
        if (Array.isArray(response.message)) {
          localStorage.setItem("errorMessage", response.message[0]);
        } else {
          localStorage.setItem(
            "errorMessage",
            response.response?.error ??
              response.message ??
              response.error ??
              "Failed to remove friend."
          );
        }
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      localStorage.setItem("errorMessage", "Failed to remove friend.");
      window.location.reload();
    }
  };

  const openConfirmModal = (
    title: string,
    message: string,
    text: string,
    action: () => void
  ) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setConfirmModalText(text);
    setPendingAction(() => action);
    setConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    pendingAction();
    setConfirmModalOpen(false);
  };

  const handleCancel = () => {
    setConfirmModalOpen(false);
  };

  useEffect(() => {
    const successMsg = localStorage.getItem("successMessage");
    if (successMsg) {
      setSuccessMessage(successMsg);
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

      <Box sx={{ width: "100%", padding: 0 }}>
        <Typography
          variant="h4"
          component={"div"}
          gutterBottom
          sx={{
            display: { xs: "flex", md: "block" },
            justifyContent: "center",
            textAlign: { xs: "center", sm: "left" },
            paddingLeft: { md: "20px" },
            fontWeight: "bold",
          }}
        >
          {getUrl("my-profile")
            ? "My Profile"
            : `${userData?.user.first_name} ${userData?.user.last_name}'s Profile`}
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
          {getUrl("my-profile") ? (
            <Typography variant="h6" component="div">
              <button
                type="button"
                className="text-white text-sm bg-[#00ff00] px-2 py-1 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300 cursor-pointer"
                onClick={() => setIsProfilePictureModalOpen(true)}
              >
                Change profile photo
              </button>
            </Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Tooltip title="Go Chat" placement="top">
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  onClick={() =>
                    userData?.user?.id && handleGoChat(userData?.user?.id)
                  }
                >
                  <ChatIcon fontSize="medium" />
                </Button>
              </Tooltip>
              {pending ? (
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  disabled
                >
                  <TimerIcon fontSize="medium" />
                </Button>
              ) : accepted ? (
                <Tooltip title="Remove Friend" placement="top">
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() =>
                      openConfirmModal(
                        "Confirm Remove",
                        "Are you sure you want to remove this friend?",
                        "Remove",
                        () => remove_friend(userData!.user.id)
                      )
                    }
                  >
                    <PersonRemoveIcon />
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip title="Add Friend" placement="top">
                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    onClick={send_friend_request}
                  >
                    <PersonAddIcon fontSize="medium" />
                  </Button>
                </Tooltip>
              )}
              {userData &&
                (blockedUsers.includes(userData.user.id) ? (
                  <Tooltip title="Unblock User" placement="top">
                    <Button
                      variant="contained"
                      color="info"
                      size="medium"
                      sx={{ marginRight: 1 }}
                      onClick={() =>
                        openConfirmModal(
                          "Unblock User",
                          `Are you sure you want to unblock ${userData.user.username}?`,
                          "Unblock",
                          () => unblock_user(userData.user.id)
                        )
                      }
                    >
                      <GppBadIcon fontSize="medium" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip title="Block User" placement="top">
                    <Button
                      variant="contained"
                      color="warning"
                      size="medium"
                      sx={{ marginRight: 1 }}
                      onClick={() =>
                        openConfirmModal(
                          "Block User",
                          `Are you sure you want to block ${userData.user.username}?`,
                          "Block",
                          () => block_user()
                        )
                      }
                    >
                      <GppBadIcon fontSize="medium" />
                    </Button>
                  </Tooltip>
                ))}
            </Box>
          )}
        </Box>
        {/* Personal Information Section */}
        <PersonalInfo
          userData={userData}
          onEdit={() => setEditPersonalInfoModalOpen(true)}
          privacy_settings={userData?.privacy_settings ?? null}
          accepted={accepted}
        />
        {/* Account Information Section */}
        <AccountInfo
          userData={userData}
          privacy_settings={userData?.privacy_settings ?? null}
          onEdit={() => setEditProfileInfoModalOpen(true)}
          copySocialLink={copy_soical_link}
          accepted={accepted}
        />
        {/* Modals */}
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
        {getUrl("my-profile") && (
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
        )}
        {/* Edit Profile Information Modal */}
        {getUrl("my-profile") && (
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
        )}
        {/* Profile Picture Modal */}
        {getUrl("my-profile") && (
          <ProfilePictureModal
            open={isProfilePictureModalOpen}
            onClose={() => setIsProfilePictureModalOpen(false)}
            onSubmit={handleProfilePictureChange}
          />
        )}
        <ConfirmModal
          open={confirmModalOpen}
          title={confirmModalTitle}
          message={confirmModalMessage}
          color="error"
          confirmText={confirmModalText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Box>
    </>
  );
};

export default ProfileInfo;
