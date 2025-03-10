import React, { useState } from "react";
import { Box } from "@mui/material";
import ErrorMessage from "../messages/ErrorMessage";
import SuccessMessage from "../messages/SuccessMessage";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import PrivacySettingsComponent from "./account/PrivacySettings";
import AccountSettingsComponent from "./account/AccountSettingsComponent";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
}

interface AccountSettingsProps {
  userData: UserProfile | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ userData }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      <AccountSettingsComponent />
      <PrivacySettingsComponent userData={userData} />
    </Box>
  );
};

export default AccountSettings;
