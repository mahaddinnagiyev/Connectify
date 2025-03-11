import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import no_profile_photo from "../../../../assets/no-profile-photo.png";
import { Account } from "../../../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../../../services/account/dto/privacy-settings-dto";
import { Users } from "../../../../services/user/dto/user-dto";
import { LastSeen } from "./../../utils/LastSeen";
import {
  PermMedia as PermMediaIcon,
  LocalPhone as LocalPhoneIcon,
  Videocam as VideocamIcon,
  MoreVert as MoreVertIcon,
  AccountBox as AccountBoxIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import MediaModal from "../../../modals/chat/MediaModals";
import { MessagesDTO } from "../../../../services/socket/dto/messages-dto";

interface ChatHeaderProps {
  otherUserAccount: Account;
  otherUserPrivacySettings: PrivacySettingsDTO;
  otherUser: Users;
  messages: MessagesDTO[]
}

const ChatHeader = ({
  otherUserAccount,
  otherUserPrivacySettings,
  otherUser,
  messages
}: ChatHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [visibleChatOptions, setVisibleChatOptions] = useState(false);
  const screenSize = window.innerWidth;
  const chatOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatOptionsRef.current &&
        !chatOptionsRef.current.contains(event.target as Node)
      ) {
        setVisibleChatOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleChatOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleChatOptions(!visibleChatOptions);
  };

  const showMediaModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleChatOptions(false);
    setIsMediaModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Tooltip title="Back" placement="top">
            <Link to={"/chat"}>
              <ChevronLeftIcon />
            </Link>
          </Tooltip>
          <img
            src={otherUserAccount?.profile_picture ?? no_profile_photo}
            alt="User Profile"
            className="rounded-full border-2 border-[var(--primary-color)]"
            style={{ height: "50px", width: "50px" }}
          />
        </div>
        <div
          className={`user-info-container ${isHovered ? "hovered" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="marquee">
            <a
              href={`/user/@${otherUser?.username}`}
              className="user-name mb-1 hover:underline text-sm"
            >
              {otherUser?.first_name} {otherUser?.last_name} | @
              {otherUser?.username}
            </a>
          </div>
          <div className="last-seen-container">
            <LastSeen
              otherUserAccount={otherUserAccount as Account}
              otherUserPrivacySettings={
                otherUserPrivacySettings as PrivacySettingsDTO
              }
              otherUserId={otherUser?.id as string}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-1 items-center md:mr-3 ml-3">
        {screenSize >= 768 && (
          <>
            <button className="call-btn">
              <LocalPhoneIcon />
            </button>
            <button className="call-btn">
              <VideocamIcon />
            </button>
          </>
        )}
        <div>
          <button onClick={toggleChatOptions}>
            <MoreVertIcon />
          </button>
          {visibleChatOptions && (
            <div ref={chatOptionsRef} className="action-buttons-2">
              <button
                className="user-profile-btn"
                onClick={() =>
                  (window.location.href = `/user/@${otherUser?.username}`)
                }
              >
                <AccountBoxIcon className="profile-icon" /> User Profile
              </button>
              <button className="user-profile-btn" onClick={(e) => showMediaModal(e)}>
                <PermMediaIcon className="profile-icon" /> Medias
              </button>
              {screenSize < 768 && (
                <>
                  <button className="user-profile-btn">
                    <LocalPhoneIcon /> Audio Call
                  </button>
                  <button className="user-profile-btn">
                    <VideocamIcon /> Video Call
                  </button>
                </>
              )}
              <button className="delete-btn">
                <DeleteIcon className="delete-icon" /> Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {isMediaModalOpen && (
        <MediaModal messages={messages} setIsMediaModalOpen={setIsMediaModalOpen}/>
      )}

    </>
  );
};

export default ChatHeader;
