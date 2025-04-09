import React, { useCallback, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
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
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { Box, CircularProgress } from "@mui/material";
import { ChatRoomsDTO } from "../../services/socket/dto/ChatRoom-dto";
import { Users } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import { Button } from "@mui/material";
import MediaModal from "../modals/chat/MediaModals";
import { getMessagesForRoom } from "../../services/socket/socket-service";
import { Socket } from "socket.io-client";
import ChangeRoomNameModal from "../modals/chat/ChangeRoomNameModal";
import ProgressModal from "../modals/chat/ProgressModal";
import CryptoJS from "crypto-js";

interface UserChatsProps {
  chats: (ChatRoomsDTO & {
    otherUser?: Users;
    otherUserAccount?: Account;
    otherUserPrivacySettings?: PrivacySettingsDTO;
  })[];
  isLoading: boolean;
  socket: Socket | null;
  truncateMessage: (message: string, maxLength: number) => string;
  currentUserId: string;
  setChats: React.Dispatch<
    React.SetStateAction<
      (ChatRoomsDTO & {
        otherUser?: Users;
        otherUserAccount?: Account;
        otherUserPrivacySettings?: PrivacySettingsDTO;
      })[]
    >
  >;
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
`;

const UserChats = ({
  chats,
  isLoading,
  socket,
  truncateMessage,
  setChats,
  currentUserId,
}: UserChatsProps) => {
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
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isChangingRoomName, setIsChangingRoomName] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

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

  useEffect(() => {
    if (!socket) return;

    const handleRoomNameChanged = (updatedRoom: ChatRoomsDTO) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === updatedRoom.id
            ? { ...chat, name: updatedRoom.name }
            : chat
        )
      );
      setIsChangingRoomName(false);

      const encryptionKey = process.env.VITE_CRYPTO_SECRET_KEY;
      const cacheKey = `connectify_chats`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { userId, chats: encryptedChats } = JSON.parse(cachedData);

        const bytes = CryptoJS.AES.decrypt(encryptedChats, encryptionKey!);
        const decryptedChats: ChatRoomsDTO[] = JSON.parse(
          bytes.toString(CryptoJS.enc.Utf8)
        );

        const updatedChats = decryptedChats.map((chat) =>
          chat.id === updatedRoom.id
            ? { ...chat, name: updatedRoom.name }
            : chat
        );

        const reEncrypted = CryptoJS.AES.encrypt(
          JSON.stringify(updatedChats),
          encryptionKey!
        ).toString();

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ userId, chats: reEncrypted })
        );
      }
    };

    socket.on("roomNameChanged", handleRoomNameChanged);

    return () => {
      socket.off("roomNameChanged", handleRoomNameChanged);
    };
  }, [socket, currentUserId, setChats]);

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

  const openRoomNameModal = (
    e: React.MouseEvent,
    roomId: string,
    name?: string
  ) => {
    e.stopPropagation();
    setRoomId(roomId);
    setRoomName(name ?? "");
    handleCloseContextMenu();
    setIsNameModalOpen(true);
  };

  const handleRoomNameChange = (roomId: string, newName: string) => {
    setIsChangingRoomName(true);
    socket?.emit("changeRoomName", { roomId, name: newName });
  };

  return (
    <>
      <div className="message-users flex flex-col gap-1 my-3">
        {isLoading ? (
          <div className="flex flex-col gap-2 items-center h-full justify-center">
            <div>
              <CircularProgress size={30} sx={{ color: "#00ff00" }} />
            </div>
            <p className="text-sm">Loading your chats</p>
          </div>
        ) : (
          <>
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
                          chat.otherUserAccount?.profile_picture ??
                          no_profile_photo
                        }
                        alt="User Profile"
                        style={{ height: "50px", width: "50px" }}
                        className="rounded-full border-2 border-[var(--primary-color)]"
                      />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm">
                          {chat.name
                            ? chat.name
                            : `${chat.otherUser?.first_name} ${chat.otherUser?.last_name} | @${chat.otherUser?.username}`}
                        </p>
                        <p className="text-xs">
                          {chat?.lastMessage?.message_type ===
                          MessageType.TEXT ? (
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
                              {chat?.lastMessage?.message_type ===
                                MessageType.DEFAULT && (
                                <>
                                  {truncateMessage(
                                    chat.lastMessage.content,
                                    45
                                  )}
                                </>
                              )}
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
          </>
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
              ref={menuRef}
              sx={{
                position: "fixed",
                top: computedTop,
                left: computedLeft,
                backgroundColor: "white",
                boxShadow: 3,
                borderRadius: "4px",
                width: `${menuWidth}px`,
                zIndex: 1300,
                animation: `${fadeIn} 0.4s ease forwards`,
                opacity: 0,
                transformOrigin: `${
                  contextMenu.mouseX + menuWidth > window.innerWidth
                    ? "right"
                    : "left"
                }`,
                pl: "8px",
              }}
            >
              <Button
                sx={{
                  color: "black",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "8px",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#00ff00",
                  },
                }}
                onClick={() => {
                  handleCloseContextMenu();
                  navigate(`/user/@${contextMenu.chat?.otherUser?.username}`);
                }}
              >
                <AccountBoxIcon /> User Profile
              </Button>
              <Button
                sx={{
                  color: "black",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "8px",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#00ff00",
                  },
                }}
                onClick={showMediaModal}
              >
                <PermMediaIcon /> See Media
              </Button>
              <Button
                sx={{
                  color: "black",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "8px",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#00ff00",
                  },
                }}
                onClick={(e: React.MouseEvent) =>
                  openRoomNameModal(
                    e,
                    contextMenu!.chat!.id!,
                    contextMenu!.chat?.name
                  )
                }
              >
                <BadgeIcon /> Room Name
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

      <ProgressModal open={isChangingRoomName} text="Changing room name" />

      {isNameModalOpen && (
        <ChangeRoomNameModal
          open={isNameModalOpen}
          roomId={roomId}
          currentName={roomName}
          onClose={() => setIsNameModalOpen(false)}
          onRoomNameChange={handleRoomNameChange}
        />
      )}
    </>
  );
};

export default UserChats;
