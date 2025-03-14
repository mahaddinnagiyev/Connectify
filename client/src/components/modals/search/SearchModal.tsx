import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./searchModal.css";
import no_profile_photo from "../../../assets/no-profile-photo.png";
import { UserFriendsDTO } from "../../../services/friendship/dto/friendship-dto";
import { getFriends } from "../../../services/friendship/friendship-service";
import { socket } from "../../../services/socket/socket-service";
import { useNavigate } from "react-router-dom";

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [userFriendData, setUserFriendData] = React.useState<UserFriendsDTO[]>(
    []
  );

  const navigate = useNavigate();

  const handleGoChat = (userId: string) => {
    socket?.emit("joinRoom", { user2Id: userId });
    socket?.once("joinRoomSuccess", (data: { roomId: string }) => {
      if (data && data.roomId) {
        navigate(`/chat?room=${data.roomId}`);
        setOpen(false);
      }
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const filterFriends = (items: UserFriendsDTO[]) => {
    return items.filter((friend) => {
      const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
      const username = friend.username.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        username.includes(searchQuery.toLowerCase())
      );
    });
  };

  React.useEffect(() => {
    const fetchAllUserFriends = async () => {
      const response = await getFriends();

      if (response.success) {
        setUserFriendData(response.friends);
      }
    };

    fetchAllUserFriends();
  }, []);

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
            width: "96%",
            maxWidth: "900px",
            margin: "auto",
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* User Friends goes here */}
            <div className="message-users flex flex-col gap-3 mb-2 mt-6">
              {filterFriends(userFriendData).length > 0 &&
                filterFriends(userFriendData).map((friend) => (
                  <>
                    <Tooltip placement="right" title="Go Chat">
                      <button
                        key={friend.id}
                        className="message-user"
                        onClick={() => handleGoChat(friend.friend_id)}
                      >
                        <div className="user-profile-photo flex items-center justify-between pr-4">
                          {/* User Information */}
                          <div className="flex items-center gap-3">
                            <img
                              src={friend.profile_picture ?? no_profile_photo}
                              alt="User Profile"
                              className="border-2 border-[var(--primary-color)] rounded-full"
                              style={{ width: "50px", height: "50px" }}
                            />
                            <div className="flex flex-col gap-1">
                              <Tooltip
                                placement="top"
                                title={`View ${friend.first_name} ${friend.last_name}'s Profile`}
                              >
                                <a
                                  href={`/user/@${friend.username}`}
                                  className="text-sm text-left hover:underline"
                                >
                                  {`${friend.first_name} ${friend.last_name}`}
                                  <br />@{friend.username}
                                </a>
                              </Tooltip>
                              {/* <p className="text-xs">
                            Hello John Doe, how are you?
                          </p> */}
                            </div>
                          </div>
                        </div>
                      </button>
                    </Tooltip>
                    <hr />
                  </>
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
