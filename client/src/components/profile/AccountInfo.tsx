import React from "react";
import { Box, TextField } from "@mui/material";
import SocialLink from "./SocialLink";

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
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  userData,
  onEdit,
  copySocialLink,
}) => {
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
          <TextField
            id="last_login"
            label="Last login"
            value={
              userData?.account.last_login
                ? userData.account.last_login
                : "There is no last login yet"
            }
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
          />
          <div className="px-2 py-2">
            <button
              type="button"
              className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300"
              onClick={onEdit}
            >
              Edit profile information
            </button>
          </div>
        </div>

        {/* Social Links Section */}
        <SocialLink
          socialLinks={userData?.account.social_links || []}
          copy_soical_link={copySocialLink}
        />
      </Box>
    </>
  );
};

export default AccountInfo;
