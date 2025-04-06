import { useEffect, useRef, useState } from "react";
import { keyframes, css } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { Box, Tooltip } from "@mui/material";
import no_profile_photo from "../../../../assets/no-profile-photo.png";
import { Account } from "../../../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../../../services/account/dto/privacy-settings-dto";
import { User } from "../../../../services/user/dto/user-dto";
import { LastSeen } from "./LastSeen";
import {
  PermMedia as PermMediaIcon,
  // LocalPhone as LocalPhoneIcon,
  // Videocam as VideocamIcon,
  MoreVert as MoreVertIcon,
  AccountBox as AccountBoxIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import MediaModal from "../../../modals/chat/MediaModals";
import { MessagesDTO } from "../../../../services/socket/dto/messages-dto";
import { Socket } from "socket.io-client";
import ErrorMessage from "../../../messages/ErrorMessage";

interface ChatHeaderProps {
  currentChatRoomName?: string;
  otherUserAccount: Account;
  otherUserPrivacySettings: PrivacySettingsDTO;
  otherUser: User;
  messages: MessagesDTO[];
  roomId: string;
  socket: Socket | null;
  isFriend: boolean;
  isFriendLoading: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.80);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}`;

const menuAnimation = css`
  animation: ${fadeIn} 0.3s ease-in-out forwards;
  transform-origin: top right;
`;

const ChatHeader = ({
  currentChatRoomName,
  otherUserAccount,
  otherUserPrivacySettings,
  otherUser,
  messages,
  roomId,
  socket,
  isFriend,
  isFriendLoading
}: ChatHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [visibleChatOptions, setVisibleChatOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatOptionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLeaveRoom = () => {
    socket?.emit("leaveRoom", { roomId });
    navigate("/messenger");
  };

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

    if (!visibleChatOptions) {
      const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
      const menu = chatOptionsRef.current;

      if (menu) {
        menu.style.top = `${buttonRect.bottom}px`;
        menu.style.left = `${buttonRect.left}px`;
      }
    }
  };

  const showMediaModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleChatOptions(false);
    setIsMediaModalOpen(true);
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Tooltip title="Back" placement="top">
            <button onClick={handleLeaveRoom}>
              <ChevronLeftIcon />
            </button>
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
              {currentChatRoomName ??
                `${otherUser?.first_name} ${otherUser?.last_name} | @
              ${otherUser?.username}`}
            </a>
          </div>
          <div className="last-seen-container">
            <LastSeen
              otherUserAccount={otherUserAccount as Account}
              otherUserPrivacySettings={
                otherUserPrivacySettings as PrivacySettingsDTO
              }
              isFriend={isFriend}
              loading={isFriendLoading}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-1 items-center md:mr-3 ml-3">
        <div>
          <button onClick={toggleChatOptions}>
            <MoreVertIcon />
          </button>
          {visibleChatOptions && (
            <Box
              ref={chatOptionsRef}
              className="action-buttons-2"
              sx={menuAnimation}
            >
              <button
                className="user-profile-btn"
                onClick={() =>
                  (window.location.href = `/user/@${otherUser?.username}`)
                }
              >
                <AccountBoxIcon className="profile-icon" /> User Profile
              </button>
              <button
                className="user-profile-btn"
                onClick={(e) => showMediaModal(e)}
              >
                <PermMediaIcon className="profile-icon" /> Medias
              </button>
            </Box>
          )}
        </div>
      </div>

      {isMediaModalOpen && (
        <MediaModal
          messages={messages}
          setIsMediaModalOpen={setIsMediaModalOpen}
        />
      )}
    </>
  );
};

export default ChatHeader;
