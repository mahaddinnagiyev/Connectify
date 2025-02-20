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
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";
import { update_privacy_settings } from "../../../services/account/account-service";
import {
  PrivacySettings as privacySettings,
  EditPrivacySettingsDTO,
  PrivacySettingsDTO,
} from "../../../services/account/dto/privacy-settings-dto";
import { User } from "../../../services/user/dto/user-dto";
import { Account } from "../../../services/account/dto/account-dto";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
}

interface PrivacySettingsProps {
  userData: UserProfile | null;
}

const PrivacySettingsComponent: React.FC<PrivacySettingsProps> = ({ userData }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<EditPrivacySettingsDTO>({
    email: privacySettings.everyone,
    gender: privacySettings.everyone,
    bio: privacySettings.everyone,
    location: privacySettings.everyone,
    social_links: privacySettings.everyone,
  });

  useEffect(() => {
    if (userData && userData.privacy_settings) {
      setPrivacy({
        email: userData.privacy_settings.email,
        gender: userData.privacy_settings.gender,
        bio: userData.privacy_settings.bio,
        location: userData.privacy_settings.location,
        social_links: userData.privacy_settings.social_links,
      });
    }
  }, [userData]);

  const handleChange = (
    field: keyof EditPrivacySettingsDTO,
    value: privacySettings
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
      console.error(error);
      setErrorMessage("An error occurred while updating privacy settings");
    }
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
        Privacy Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

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
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my email information?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.email}
              onChange={(e) =>
                handleChange("email", e.target.value as privacySettings)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value={privacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={privacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={privacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my gender information?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value as privacySettings)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value={privacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={privacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={privacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my bio?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.bio}
              onChange={(e) =>
                handleChange("bio", e.target.value as privacySettings)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value={privacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={privacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={privacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my location?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.location}
              onChange={(e) =>
                handleChange("location", e.target.value as privacySettings)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value={privacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={privacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={privacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my social links?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.social_links}
              onChange={(e) =>
                handleChange("social_links", e.target.value as privacySettings)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value={privacySettings.everyone}>Everyone</MenuItem>
              <MenuItem value={privacySettings.my_friends}>My Friends</MenuItem>
              <MenuItem value={privacySettings.nobody}>Nobody</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

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

export default PrivacySettingsComponent;
