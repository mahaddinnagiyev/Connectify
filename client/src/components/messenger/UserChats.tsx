import { Link, useNavigate } from "react-router-dom";
import no_profile_photo from "../../assets/no-profile-photo.png";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import {
  PermMedia as PermMediaIcon,
  Description as DescriptionIcon,
  Slideshow as SlideshowIcon,
  ImageTwoTone as ImageTwoToneIcon,
  KeyboardVoiceTwoTone as KeyboardVoiceTwoToneIcon,
  AccountBox as AccountBoxIcon,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { ChatRoomsDTO } from "../../services/socket/dto/ChatRoom-dto";
import { Users } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import MediaModal from "../modals/chat/MediaModals";
import { getMessagesForRoom } from "../../services/socket/socket-service";

interface UserChatsProps {
  chats: (ChatRoomsDTO & {
    otherUser?: Users;
    otherUserAccount?: Account;
    otherUserPrivacySettings?: PrivacySettingsDTO;
  })[];
  truncateMessage: (message: string, maxLength: number) => string;
}

const UserChats = ({ chats, truncateMessage }: UserChatsProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    chat?: ChatRoomsDTO & {
      otherUser?: Users;
      otherUserAccount?: Account;
      otherUserPrivacySettings?: PrivacySettingsDTO;
    };
  } | null>(null);

  const [messages, setMessages] = useState<MessagesDTO[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (contextMenu) {
      const { chat } = contextMenu;

      if (chat) {
        getMessagesForRoom(chat.id).then((response) => {
          setMessages(response);
        });
      }
    }
  });

  const handleContextMenu = useCallback(
    (
      event: React.MouseEvent,
      chat: ChatRoomsDTO & {
        otherUser?: Users;
        otherUserAccount?: Account;
        otherUserPrivacySettings?: PrivacySettingsDTO;
      }
    ) => {
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        chat,
      });
    },
    []
  );

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const showMediaModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCloseContextMenu();
    setIsMediaModalOpen(true);
  };

  return (
    <>
      <div className="message-users flex flex-col gap-1 my-3">
        {chats.length > 0 ? (
          <>
            {chats.map((chat, index) => (
              <Link
                to={`?room=${chat.id}`}
                key={index}
                className="message-user px-2 py-2 hover:bg-[var(--secondary-color)] hover:rounded-lg cursor-pointer transition-all duration-500"
                onContextMenu={(event) => handleContextMenu(event, chat)}
              >
                <div className="flex items-center gap-3 relative">
                  <img
                    src={
                      chat.otherUserAccount?.profile_picture ?? no_profile_photo
                    }
                    alt="User Profile"
                    style={{ height: "50px", width: "50px" }}
                    className="rounded-full border-2 border-[var(--primary-color)]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      {chat.otherUser?.first_name} {chat.otherUser?.last_name} |
                      @{chat.otherUser?.username}
                    </p>
                    <p className="text-xs">
                      {chat?.lastMessage?.message_type === MessageType.TEXT ? (
                        truncateMessage(
                          chat?.lastMessage?.content ?? "No message",
                          30
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {chat?.lastMessage?.message_type ===
                            MessageType.IMAGE && (
                            <>
                              <ImageTwoToneIcon /> Image
                            </>
                          )}
                          {chat?.lastMessage?.message_type ===
                            MessageType.AUDIO && (
                            <>
                              <KeyboardVoiceTwoToneIcon
                                style={{ fontSize: "16px" }}
                              />
                              Voice Message
                            </>
                          )}
                          {chat?.lastMessage?.message_type ===
                            MessageType.FILE && (
                            <>
                              <DescriptionIcon />
                              File
                            </>
                          )}
                          {chat?.lastMessage?.message_type ===
                            MessageType.VIDEO && (
                            <>
                              <SlideshowIcon />
                              Video
                            </>
                          )}

                          {![
                            MessageType.IMAGE,
                            MessageType.AUDIO,
                            MessageType.FILE,
                            MessageType.VIDEO,
                          ].includes(
                            chat?.lastMessage?.message_type ??
                              MessageType.DEFAULT
                          ) && <span>Media</span>}
                        </span>
                      )}
                    </p>
                  </div>
                  {chat.unreadCount! > 0 && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center h-full justify-center">
            <p className="text-gray-500 text-center">No chats found</p>
            <p className="text-gray-500 text-[10px] text-center">
              If you can not see your chat's{" "}
              <b
                className="underline hover:text-[var(--primary-color)] transition-colors duration-200 cursor-pointer"
                onClick={() => window.location.reload()}
              >
                click here
              </b>
            </p>
            <p className="text-gray-500 text-[10px] text-center">
              You do not have any friends.{" "}
              <a
                href="/friends"
                className="underline font-extrabold hover:text-[var(--primary-color)] transition-colors duration-200 cursor-pointer"
              >
                Click here
              </a>{" "}
              and find new friends
            </p>
          </div>
        )}
      </div>

      {contextMenu !== null &&
        (() => {
          const menuWidth = 160;
          const computedLeft =
            contextMenu.mouseX + menuWidth > window.innerWidth
              ? contextMenu.mouseX - menuWidth
              : contextMenu.mouseX;

          const menuHeight = 135;
          const computedTop =
            contextMenu.mouseY + menuHeight > window.innerHeight
              ? contextMenu.mouseY - menuHeight
              : contextMenu.mouseY;

          return (
            <Box
              sx={{
                position: "fixed",
                top: computedTop,
                left: computedLeft,
                backgroundColor: "white",
                boxShadow: 3,
                borderRadius: "4px",
                width: `${menuWidth}px`,
                zIndex: 1300,
              }}
              onMouseLeave={handleCloseContextMenu}
            >
              <Button
                sx={{
                  color: "black",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                  display: "flex",
                  gap: "8px",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#00ff00",
                  },
                }}
                onClick={() =>
                  navigate(`/user/@${contextMenu.chat?.otherUser?.username}`)
                }
              >
                <AccountBoxIcon /> Profile
              </Button>
              <Button
                sx={{
                  color: "black",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                  display: "flex",
                  gap: "8px",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#00ff00",
                  },
                }}
                onClick={showMediaModal}
              >
                <PermMediaIcon /> Media
              </Button>
            </Box>
          );
        })()}

      {isMediaModalOpen && (
        <MediaModal
          messages={messages}
          setIsMediaModalOpen={setIsMediaModalOpen}
        />
      )}
    </>
  );
};

export default UserChats;
