import React from "react";
import { Box, TextField } from "@mui/material";
import SocialLink from "./SocialLink";
import {
  PrivacySettings,
  PrivacySettingsDTO,
} from "../../services/account/dto/privacy-settings-dto";

interface AccountInfoProps {
  userData: {
    account: {
      bio: string | null;
      location: string | null;
      last_login?: Date;
      social_links: { id: string; name: string; link: string }[];
    };
  } | null;
  onEdit: () => void;
  copySocialLink: (link: string) => void;
  privacy_settings: PrivacySettingsDTO | null;
  accepted: boolean;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  userData,
  onEdit,
  copySocialLink,
  privacy_settings,
  accepted,
}) => {
  const getUrl = (params: string): boolean => {
    return window.location.href.includes(params);
  };

  return (
    <>
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
          {getUrl("my-profile") ||
          privacy_settings?.bio === PrivacySettings.everyone ? (
            <TextField
              id="bio"
              label="Bio"
              value={userData?.account.bio ?? "There is no bio yet"}
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
          ) : (
            <>
              {privacy_settings?.bio === PrivacySettings.my_friends &&
              accepted ? (
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
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
                />
              ) : (
                ""
              )}
            </>
          )}
          {getUrl("my-profile") ||
          privacy_settings?.location === PrivacySettings.everyone ? (
            <TextField
              id="location"
              label="Location"
              value={
                userData?.account.location
                  ? userData.account.location
                  : "There is no location yet"
              }
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
          ) : (
            <>
              {privacy_settings?.location === PrivacySettings.my_friends &&
              accepted ? (
                <TextField
                  id="location"
                  label="Location"
                  value={
                    userData?.account.location
                      ? userData.account.location
                      : "There is no location yet"
                  }
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
                />
              ) : (
                ""
              )}
            </>
          )}
          {getUrl("my-profile") ||
          privacy_settings?.last_login === PrivacySettings.everyone ? (
            <TextField
              id="last_login"
              label="Last seen"
              value={
                userData?.account.last_login
                  ? new Date(userData.account.last_login).toLocaleTimeString(
                      "az-AZ",
                      {
                        timeZone: "Asia/Baku",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "There is no last login yet"
              }
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
            />
          ) : (
            <>
              {privacy_settings?.last_login === PrivacySettings.my_friends &&
              accepted ? (
                <TextField
                  id="last_login"
                  label="Last seen"
                  value={
                    userData?.account.last_login
                      ? new Date(
                          userData.account.last_login
                        ).toLocaleTimeString("az-AZ", {
                          timeZone: "Asia/Baku",
                          day: "numeric",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "There is no last login yet"
                  }
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
                />
              ) : (
                ""
              )}
            </>
          )}
          {getUrl("my-profile") && (
            <div className="px-2 py-2">
              <button
                type="button"
                className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300"
                onClick={onEdit}
              >
                Edit profile information
              </button>
            </div>
          )}
        </div>

        {/* Social Links Section */}
        <SocialLink
          socialLinks={userData?.account.social_links || []}
          copy_soical_link={copySocialLink}
          privacy_settings={privacy_settings ?? null}
          accepted={accepted}
        />
      </Box>
    </>
  );
};

export default AccountInfo;
