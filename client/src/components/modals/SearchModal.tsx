import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./searchModal.css";
import no_profile_photo from "../../assets/no-profile-photo.png";

export default function SearchModal() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Tooltip title="Search in your friends" placement="top">
        <button onClick={handleClickOpen} className="search-modal-button">
          <SearchIcon />
        </button>
      </Tooltip>
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          style: {
            width: "60%", // Set the width to 60%
            maxWidth: "900px", // Optional: Limit maximum width
            margin: "auto", // Center the dialog
            position: "relative",
          },
        }}
        className="search-dialog"
      >
        <DialogTitle className="dialog-title">Search Friends</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {/* SearchBar goes here */}
            <div className="friend-search-input">
              <input
                type="text"
                placeholder="Search for a friend"
                className="search-input"
              />
            </div>

            {/* User Friends goes here */}
            <div className="message-users flex flex-col gap-3 my-3">
              {Array(50)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="message-user my-2">
                    <a
                      href="/help"
                      className="user-profile-photo flex items-center justify-between pr-4"
                      onClick={(e) => e.preventDefault()}
                    >
                      {/* User Information */}
                      <div className="flex items-center gap-3">
                        <img
                          src={no_profile_photo}
                          alt="User Profile"
                          width={50}
                          height={50}
                        />
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">John Doe</p>
                          <p className="text-xs">
                            Hello John Doe, how are you?
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button onClick={handleClose} className="search-modal-close-button">
            Close
          </button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
