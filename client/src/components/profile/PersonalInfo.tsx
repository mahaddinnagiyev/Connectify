// PersonalInfo.tsx
import React from "react";
import { Box, TextField } from "@mui/material";

interface PersonalInfoProps {
  userData: {
    user: {
      first_name: string | null;
      last_name: string | null;
      username: string | null;
      email: string | null;
      gender: string | null;
    };
  } | null;
  onEdit: () => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userData, onEdit }) => {
  const getUrl = (params: string): boolean => {
    return window.location.href.includes(params);
  };

  return (
    <>
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
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%", md: "50%" } }}
          />
          <TextField
            id="lastName"
            label="Last Name"
            value={userData?.user.last_name || ""}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
          />
          <TextField
            id="username"
            label="Username"
            value={userData?.user.username || ""}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
          />
          <TextField
            id="email"
            label="Email"
            value={userData?.user.email || ""}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
          />
          <TextField
            id="gender"
            label="Gender"
            value={
              userData?.user.gender
                ? userData.user.gender.charAt(0).toUpperCase() +
                  userData.user.gender.slice(1)
                : ""
            }
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            sx={{ maxWidth: { xs: "100%", sm: "50%" } }}
          />
        </div>
        {getUrl("my-profile") && (
          <div className="px-2 py-2">
            <button
              type="button"
              className="text-white bg-[#00ff00] px-4 py-3 rounded border-2 border-[#00ff00] hover:bg-white hover:text-[#00ff00] transition duration-300"
              onClick={onEdit}
            >
              Edit personal information
            </button>
          </div>
        )}
      </Box>
    </>
  );
};

export default PersonalInfo;
