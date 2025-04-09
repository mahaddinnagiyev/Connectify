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
import CheckModal from "../../modals/spinner/CheckModal";
import CryptoJS from "crypto-js";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
}

interface PrivacySettingsProps {
  userData: UserProfile | null;
}

const PrivacySettingsComponent: React.FC<PrivacySettingsProps> = ({
  userData,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<EditPrivacySettingsDTO>({
    email: privacySettings.everyone,
    gender: privacySettings.everyone,
    bio: privacySettings.everyone,
    location: privacySettings.everyone,
    social_links: privacySettings.everyone,
    last_login: privacySettings.everyone,
  });

  useEffect(() => {
    if (userData && userData.privacy_settings) {
      setPrivacy({
        email: userData.privacy_settings.email,
        gender: userData.privacy_settings.gender,
        bio: userData.privacy_settings.bio,
        location: userData.privacy_settings.location,
        social_links: userData.privacy_settings.social_links,
        last_login: userData.privacy_settings.last_login,
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
      setLoading(true);
      const response = await update_privacy_settings(privacy);

      if (response.success) {
        setSuccessMessage(
          response.message || "Privacy settings updated successfully"
        );

        const cacheKey = "connectify_settings";
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

            decryptedData.privacy_settings = privacy;

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
      } else {
        setErrorMessage(response.error || "Failed to update privacy settings");
      }
    } catch (error) {
      console.log(error);
      if (error) {
        setErrorMessage("An error occurred while updating privacy settings");
      }
    } finally {
      setLoading(false);
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
      {loading && <CheckModal message="Updating privacy settings" />}

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Who can see my last login date?</Typography>
          <FormControl variant="outlined" size="small">
            <Select
              value={privacy.last_login}
              onChange={(e) =>
                handleChange("last_login", e.target.value as privacySettings)
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
