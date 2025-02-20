import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Divider,
  Button,
  FormControl,
} from "@mui/material";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import { update_privacy_settings } from "../../services/account/account-service";
import {
  PrivacySettings,
  EditPrivacySettingsDTO,
} from "../../services/account/dto/privacy-settings-dto";

interface UserProfile {
  user: User;
  account: Account;
}

interface AccountSettingsProps {
  userData: UserProfile | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ userData }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<EditPrivacySettingsDTO>({
    email: PrivacySettings.everyone,
    gender: PrivacySettings.everyone,
    bio: PrivacySettings.everyone,
    location: PrivacySettings.everyone,
    social_links: PrivacySettings.everyone,
  });

  useEffect(() => {
    if (userData && userData.account.privacy_settings) {
      setPrivacy(userData.account.privacy_settings);
    }
  }, [userData]);

  const handleChange = (
    field: keyof EditPrivacySettingsDTO,
    value: PrivacySettings
  ) => {
    setPrivacy((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await update_privacy_settings(privacy);
      if (response.success) {
        setSuccessMessage(
          response.message || "Privacy settings updated successfully"
        );
      } else {
        setErrorMessage(response.error || "Failed to update privacy settings");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("An error occurred while updating privacy settings");
    }
    window.location.reload();
  };

  return (
    <Box sx={{ width: "100%", padding: 0 }}>
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

      {/* Başlıq */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          display: { xs: "flex", md: "block" },
          justifyContent: "center",
          textAlign: { xs: "center", sm: "left" },
          paddingLeft: { md: "20px" },
          fontWeight: "bold",
        }}
      >
        Privacy Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Məxfilik Ayarları */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          px: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Everyone can see your Email?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.email}
              onChange={(e) =>
                handleChange("email", e.target.value as PrivacySettings)
              }
              sx={{
                width: "150px",
              }}
            >
              <MenuItem value={PrivacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={PrivacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={PrivacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Everyone can see your Gender?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value as PrivacySettings)
              }
              sx={{
                width: "150px",
              }}
            >
              <MenuItem value={PrivacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={PrivacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={PrivacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Everyone can see your Bio?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.bio}
              onChange={(e) =>
                handleChange("bio", e.target.value as PrivacySettings)
              }
              sx={{
                width: "150px",
              }}
            >
              <MenuItem value={PrivacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={PrivacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={PrivacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Everyone can see your Location?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.location}
              onChange={(e) =>
                handleChange("location", e.target.value as PrivacySettings)
              }
              sx={{
                width: "150px",
              }}
            >
              <MenuItem value={PrivacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={PrivacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={PrivacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Everyone can see your Social Links</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.social_links}
              onChange={(e) =>
                handleChange("social_links", e.target.value as PrivacySettings)
              }
              sx={{
                width: "150px",
              }}
            >
              <MenuItem value={PrivacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={PrivacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={PrivacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Save düyməsi */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ backgroundColor: "var(--primary-color)" }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default AccountSettings;
