import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../colors.css";
import "./css/style.css";
import Chat from "./Chat";
import SearchModal from "../modals/search/SearchModal";
import no_profile_photo from "../../assets/no-profile-photo.png";
import { socket } from "../../services/socket/socket-service";
import { ChatRoomsDTO } from "../../services/socket/dto/ChatRoom-dto";
import { getToken } from "../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../../services/user/user-service";
import { Users } from "../../services/user/dto/user-dto";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Account } from "../../services/account/dto/account-dto";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ImageTwoToneIcon from "@mui/icons-material/ImageTwoTone";
import KeyboardVoiceTwoToneIcon from "@mui/icons-material/KeyboardVoiceTwoTone";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import ErrorMessage from "../messages/ErrorMessage";

const Messenger = () => {
  const [chats, setChats] = useState<
    (ChatRoomsDTO & {
      otherUser?: Users;
      otherUserAccount?: Account;
      otherUserPrivacySettings?: PrivacySettingsDTO;
    })[]
  >([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagesDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const currentRoomId = searchParams.get("room");
  const lastJoinedRoomRef = useRef<string | null>(null);
  const socketRef = useRef(socket);

  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeToPushNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const reg = await navigator.serviceWorker.ready;
      const existingSubscription = await reg.pushManager.getSubscription();

      if (existingSubscription) {
        setIsSubscribed(true);
        return;
      }

      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY,
      });

      const response = await fetch(
        `${process.env.SERVER_USER_URL}/api/webpush/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSubscription),
        }
      );

      if (response.ok) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      setErrorMessage("Error subscribing to push notifications");
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      subscribeToPushNotifications();
    }
  };

  useEffect(() => {
    if ("Notification" in window && !isSubscribed) {
      requestNotificationPermission();
    }
  });

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        const decodedToken: { id: string } = jwtDecode(token);
        setCurrentUser(decodedToken.id);
      }
    });
  }, []);

  useEffect(() => {
    if (currentRoomId && chats.length > 0) {
      const currentChat = chats.find((chat) => chat.id === currentRoomId);
      if (
        currentChat?.otherUser?.id &&
        lastJoinedRoomRef.current !== currentRoomId
      ) {
        socket?.emit("joinRoom", { user2Id: currentChat.otherUser.id });
        socket?.emit("setMessageRead", { roomId: currentRoomId });
        lastJoinedRoomRef.current = currentRoomId;
      }
    }
  }, [currentRoomId, chats]);

  useEffect(() => {
    if (currentRoomId) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentRoomId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [currentRoomId]);

  useEffect(() => {
    const handleUnreadCountUpdated = (data: {
      roomId: string;
      count: number;
    }) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === data.roomId ? { ...chat, unreadCount: data.count } : chat
        )
      );
    };

    socket?.on("unreadCountUpdated", handleUnreadCountUpdated);
    return () => {
      socket?.off("unreadCountUpdated", handleUnreadCountUpdated);
    };
  }, []);

  useEffect(() => {
    const handleLastMessageUpdated = (data: {
      roomId: string;
      lastMessage: MessagesDTO | null;
    }) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === data.roomId
            ? { ...chat, lastMessage: data.lastMessage ?? undefined }
            : chat
        )
      );
    };

    socket?.on("lastMessageUpdated", handleLastMessageUpdated);
    return () => {
      socket?.off("lastMessageUpdated", handleLastMessageUpdated);
    };
  }, []);

  useEffect(() => {
    const handleNewMessage = (newMessage: MessagesDTO) => {
      setChats((prevChats) => {
        let updatedChats = prevChats.map((chat) => {
          if (chat.id === newMessage.room_id) {
            if (newMessage.room_id === currentRoomId) {
              return {
                ...chat,
                lastMessage: { ...newMessage },
                unreadCount: 0,
              };
            } else {
              return {
                ...chat,
                lastMessage: { ...newMessage },
                unreadCount: (chat.unreadCount || 0) + 1,
              };
            }
          }
          return chat;
        });
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.id === newMessage.room_id
        );
        if (chatIndex > -1) {
          const [chatToMove] = updatedChats.splice(chatIndex, 1);
          updatedChats = [chatToMove, ...updatedChats];
        }
        return updatedChats;
      });

      if (newMessage.room_id === currentRoomId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket?.on("newMessage", handleNewMessage);
    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [currentRoomId]);

  useEffect(() => {
    setMessages([]);
    if (!currentRoomId) return;
    socket?.emit("getMessages", { roomId: currentRoomId });
    socket?.on("messages", (data) => {
      if (data.messages[0]?.room_id === currentRoomId) {
        setMessages(data.messages);
      }
    });
    return () => {
      socket?.off("messages");
    };
  }, [currentRoomId]);

  useEffect(() => {
    const fetchChats = async () => {
      const token = await getToken();
      if (!token) return;

      const decodedToken: { id: string } = jwtDecode(token);
      const currentUserId = decodedToken.id;

      if (!socket) return;

      socket.emit("getChatRooms");
      socket.on("getChatRooms", async (chatRooms: ChatRoomsDTO[]) => {
        const chatsWithUsers = await Promise.all(
          chatRooms.map(async (chat) => {
            const otherUserId = chat.user_ids.find(
              (id) => id !== currentUserId
            );
            if (!otherUserId) return chat;

            try {
              const userResponse = await getUserById(otherUserId);
              if (userResponse.success) {
                return {
                  ...chat,
                  otherUser: userResponse.user as Users,
                  otherUserAccount: userResponse.account as Account,
                  otherUserPrivacySettings:
                    userResponse.privacy_settings as PrivacySettingsDTO,
                };
              }
            } catch (error) {
              console.error("User fetch error:", error);
            }
            return chat;
          })
        );

        setChats(chatsWithUsers);
      });
    };
    fetchChats();
    socket?.on("chatRoomsUpdated", fetchChats);
    return () => {
      socket?.off("chatRoomsUpdated", fetchChats);
      socket?.off("getChatRooms");
    };
  }, [socketRef]);

  const currentChat = chats.find((chat) => chat.id === currentRoomId);

  const truncateMessage = (message: string, maxLength: number) => {
    if (!message) return "";

    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <section className="messenger-container">
        <div className="messenger flex gap-3">
          {/* Chat List */}
          <div
            className={`messenger-left text-left ${
              currentRoomId ? "rpv-messenger-left" : ""
            }`}
          >
            <div className="left-header pt-2 pb-5 px-1 flex justify-between">
              <div>Messenger</div>
              <div>
                <SearchModal />
              </div>
            </div>
            <hr className="font-bold" />
            <div className="message-users flex flex-col gap-1 my-3">
              {chats.map((chat, index) => (
                <Link
                  to={`?room=${chat.id}`}
                  key={index}
                  className="message-user px-2 py-2 hover:bg-[var(--secondary-color)] hover:rounded-lg cursor-pointer transition-all duration-500"
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
                        {chat.otherUser?.first_name} {chat.otherUser?.last_name}{" "}
                        | @{chat.otherUser?.username}
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
            </div>
          </div>
          {/* Chat Room */}
          <div
            className={`messenger-right text-left ${
              currentRoomId && currentChat
                ? ""
                : "bg-[var(--chatroom-bg-color)] border-2 border-[var(--chatroom-bg-color)] rounded-lg"
            } ${currentRoomId ? "rpv-messenger-right" : ""}`}
          >
            {currentRoomId && currentChat && (
              <Chat
                key={currentRoomId}
                currentUser={currentUser ?? ""}
                roomId={currentRoomId}
                otherUser={currentChat.otherUser}
                otherUserAccount={currentChat.otherUserAccount}
                otherUserPrivacySettings={currentChat.otherUserPrivacySettings}
                messages={messages}
                truncateMessage={truncateMessage}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Messenger;
