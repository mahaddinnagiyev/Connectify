import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import "../../colors.css";
import "./css/style.css";
import Chat from "./Chat";
import SearchModal from "../modals/search/SearchModal";
import { createSocket } from "../../services/socket/socket-service";
import { ChatRoomsDTO } from "../../services/socket/dto/ChatRoom-dto";
import { getToken } from "../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../../services/user/user-service";
import { Users } from "../../services/user/dto/user-dto";
import { MessagesDTO } from "../../services/socket/dto/messages-dto";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import ErrorMessage from "../messages/ErrorMessage";
import UserChats from "./UserChats";
import { Socket } from "socket.io-client";

const Messenger = () => {
  const [chats, setChats] = useState<
    (ChatRoomsDTO & {
      otherUser?: Users;
      otherUserAccount?: Account;
      otherUserPrivacySettings?: PrivacySettingsDTO;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagesDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const currentRoomId = searchParams.get("room");
  const lastJoinedRoomRef = useRef<string | null>(null);
  const socketRef = useRef(socket);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const screenWidth = window.innerWidth;

  const [isSubscribed, setIsSubscribed] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messagesContainerRef]);

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
    const createSocketInstance = async () => {
      const socketInstance = await createSocket();
      socketInstance?.on("connect", () => {
        setSocket(socketInstance);
      });
    };

    createSocketInstance();
  }, []);

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
        scrollToBottom();
        socket?.emit("joinRoom", { user2Id: currentChat.otherUser.id });
        socket?.emit("setMessageRead", { roomId: currentRoomId });
        lastJoinedRoomRef.current = currentRoomId;
      }
    }
  }, [currentRoomId, chats, socket, scrollToBottom]);

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
  }, [socket]);

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
  }, [socket]);

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
    scrollToBottom();
    socket?.on("newMessage", handleNewMessage);
    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [currentRoomId, socket, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
    if (!currentRoomId) return;
    socket?.emit("getMessages", { roomId: currentRoomId, limit: 30 });
    socket?.on("messages", (data) => {
      if (data.messages[0]?.room_id === currentRoomId) {
        setMessages(data.messages);
      }

      if (data.messages.length < 30) {
        setHasMoreMessages(false);
      } else {
        setHasMoreMessages(true);
      }
    });
    return () => {
      socket?.off("messages");
    };
  }, [currentRoomId, socket]);

  useEffect(() => {
    const fetchChats = async () => {
      const token = await getToken();
      if (!token) return;

      const decodedToken: { id: string } = jwtDecode(token);
      const currentUserId = decodedToken.id;

      const cacheKey = `cachedChats_${currentUserId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { userId, chats: cachedChats } = JSON.parse(cachedData);
        if (userId === currentUserId) {
          setChats(cachedChats);
          setIsLoading(false);
        }
      }

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
              if (error) {
                setErrorMessage("Failed to get user");
              }
            }
            return chat;
          })
        );

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ userId: currentUserId, chats: chatsWithUsers })
        );

        setChats(chatsWithUsers);
        setIsLoading(false);
      });
    };

    fetchChats();
    socket?.on("chatRoomsUpdated", fetchChats);
    return () => {
      socket?.off("chatRoomsUpdated", fetchChats);
      socket?.off("getChatRooms");
    };
  }, [socketRef, socket, currentUser]);

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

      <section
        className="messenger-container"
        style={{
          paddingTop:
            screenWidth < 768 && window.location.href.includes("room")
              ? "0px"
              : "",

          margin:
            screenWidth < 768 && window.location.href.includes("room")
              ? "0px"
              : "0 auto",

          height:
            screenWidth < 768 && window.location.href.includes("room")
              ? "100vh"
              : "",
        }}
      >
        <div
          className="messenger flex gap-3"
          style={{
            marginTop:
              screenWidth < 768 && window.location.href.includes("room")
                ? "0px"
                : "",
            width:
              screenWidth < 768 && window.location.href.includes("room")
                ? "100vw"
                : "",
            minHeight:
              screenWidth < 768 && window.location.href.includes("room")
                ? "100vh"
                : "",
            paddingBottom:
              screenWidth < 768 && window.location.href.includes("room")
                ? "0px"
                : "",
          }}
        >
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

            <UserChats
              chats={chats}
              truncateMessage={truncateMessage}
              socket={socket}
              currentUserId={currentUser!}
              isLoading={isLoading}
              setChats={setChats}
            />
          </div>
          {/* Chat Room */}
          <div
            className={`messenger-right text-left ${
              currentRoomId && currentChat
                ? ""
                : "bg-[var(--chatroom-bg-color)] border-2 border-[var(--chatroom-bg-color)] rounded-lg"
            } ${currentRoomId ? "rpv-messenger-right" : ""}`}
          >
            {currentRoomId && currentChat ? (
              <Chat
                key={currentRoomId}
                currentUser={currentUser ?? ""}
                roomId={currentRoomId}
                currentChatRoomName={currentChat.name}
                otherUser={currentChat.otherUser}
                otherUserAccount={currentChat.otherUserAccount}
                otherUserPrivacySettings={currentChat.otherUserPrivacySettings}
                messages={messages}
                setMessages={setMessages}
                messagesContainerRef={messagesContainerRef}
                hasMoreMessages={hasMoreMessages}
                setHasMoreMessages={setHasMoreMessages}
                scrollToBottom={scrollToBottom}
                truncateMessage={truncateMessage}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg font-semibold">
                  Select a chat to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Messenger;
