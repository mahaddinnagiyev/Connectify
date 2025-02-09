import { useState, useEffect } from "react";
import "../../colors.css";
import "./style.css";
import Chat from "./Chat";
import SearchModal from "../modals/search/SearchModal";

import no_profile_photo from "../../assets/no-profile-photo.png";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

const Messenger = () => {
  const [visibleUserIndex, setVisibleUserIndex] = useState<number | null>(null);
  const [visibleChatIndex, setVisibleChatIndex] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setVisibleUserIndex(null);
      setVisibleChatIndex(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleRightClick = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setVisibleUserIndex(visibleUserIndex === index ? null : index);
  };

  const toggleChatOptions = (event: React.MouseEvent) => {
    event.stopPropagation();
    setVisibleChatIndex(!visibleChatIndex);
  };

  return (
    <section className="messenger-container">
      <div className="messenger flex gap-3">
        {/* Chat User Part */}
        <div className="messenger-left text-left">
          <div className="left-header pt-2 pb-5 px-1 flex justify-between">
            <div>Messenger</div>
            <div>
              {/* Modal Component */}
              <SearchModal />
            </div>
          </div>
          <hr className="font-bold" />

          <div className="message-users flex flex-col gap-3 my-3">
            {Array(50)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="message-user my-2"
                  onContextMenu={(e) => handleRightClick(index, e)}
                >
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
                        <p className="text-xs">Hello John Doe, how are you?</p>
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className="relative">
                      {visibleUserIndex === index && (
                        <div className="action-buttons">
                          <button className="user-profile-btn">
                            <AccountBoxIcon className="profile-icon" /> User
                            Profile
                          </button>
                          <button className="delete-btn">
                            <DeleteIcon className="delete-icon" /> Delete Chat
                          </button>
                          <button className="block-btn">
                            <BlockIcon /> Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </a>
                </div>
              ))}
          </div>
        </div>

        {/* Chat Rooms Part */}
        <div className="messenger-right text-left">
          <div className="right-header pb-3 px-4 max-h-[55px] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <img src={no_profile_photo} alt="" width={50} height={40} />

              <div>
                <p className="text-sm mb-1">John Doe</p>
                <p className="text-xs">Last seen at 5:30 PM</p>
              </div>
            </div>
            <div className="flex gap-1 items-center mr-3">
              <div>
                <button className="call-btn">
                  <LocalPhoneIcon />
                </button>
              </div>
              <div>
                <button className="call-btn">
                  <VideocamIcon />
                </button>
              </div>
              <div>
                <button onClick={(e) => toggleChatOptions(e)}>
                  <MoreVertIcon />
                </button>
                {visibleChatIndex && (
                  <div className="action-buttons-2">
                    <button className="user-profile-btn">
                      <AccountBoxIcon className="profile-icon" /> User Profile
                    </button>
                    <button className="delete-btn">
                      <DeleteIcon className="delete-icon" /> Delete Chat
                    </button>
                    <button className="block-btn">
                      <BlockIcon /> Block User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <hr className="font-bold" />

          <Chat />
        </div>
      </div>
    </section>
  );
};

export default Messenger;
