import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../colors.css";
import "./style.css";
import Chat from "./Chat";
import SearchModal from "../modals/search/SearchModal";
import no_profile_photo from "../../assets/no-profile-photo.png";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { socket } from "../../services/socket/socket-service";
import { ChatRoomsDTO } from "../../services/socket/dto/ChatRoom-dto";
import { getToken } from "../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../../services/user/user-service";
import { Users } from "../../services/user/dto/user-dto";
import {
  MessagesDTO,
  MessageStatus,
} from "../../services/socket/dto/messages-dto";
import { Account } from "../../services/account/dto/account-dto";

const Messenger = () => {
  const [visibleUserIndex, setVisibleUserIndex] = useState<number | null>(null);
  const [chats, setChats] = useState<
    (ChatRoomsDTO & { otherUser?: Users; otherUserAccount?: Account })[]
  >([]);
  const [messages, setMessages] = useState<MessagesDTO[]>([]);
  const [searchParams] = useSearchParams();
  const currentRoomId = searchParams.get("room");
  const lastJoinedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      currentRoomId &&
      chats.length > 0 &&
      lastJoinedRoomRef.current !== currentRoomId
    ) {
      const currentChat = chats.find((chat) => chat.id === currentRoomId);
      if (currentChat?.otherUser?.id) {
        socket?.emit("joinRoom", { user2Id: currentChat.otherUser.id });
        socket?.emit("setMessageRead", { roomId: currentRoomId });
        lastJoinedRoomRef.current = currentRoomId;
      }
    }
  }, [currentRoomId, chats]);

  useEffect(() => {
    const handleMessagesRead = (data: { roomId: string }) => {
      if (data.roomId === currentRoomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.status !== MessageStatus.READ
              ? { ...msg, status: MessageStatus.READ }
              : msg
          )
        );
      }
    };

    socket?.on("messagesRead", handleMessagesRead);
    return () => {
      socket?.off("messagesRead", handleMessagesRead);
    };
  }, [currentRoomId]);

  useEffect(() => {
    const handleNewMessage = (newMessage: MessagesDTO) => {
      if (newMessage.room_id === currentRoomId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === newMessage.room_id
            ? { ...chat, lastMessage: { ...newMessage } }
            : chat
        )
      );
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
    socket?.emit("setMessageRead", { roomId: currentRoomId });
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
                };
              }
            } catch (error) {
              console.error("User fetch error:", error);
            }

            return chat;
          })
        );

        let unreadCount: number = 0;
        const user_ids: string[] = [];

        chatRooms.map((chat) => {
          if (chat.unreadCount! > 0) {
            unreadCount += chat.unreadCount!;
            const otherUserId = chat.user_ids.find(
              (id) => id !== currentUserId
            );

            user_ids.push(otherUserId!);
          }
        });

        if (unreadCount > 0) {
          localStorage.setItem(
            "infoMessage",
            `You have ${unreadCount} unread messages from ${user_ids.length} users`
          );
        }
        setChats(chatsWithUsers);
      });
    };
    fetchChats();
    return () => {
      socket?.off("getChatRooms");
    };
  }, [socket]);

  const currentChat = chats.find((chat) => chat.id === currentRoomId);

  return (
    <section className="messenger-container">
      <div className="messenger flex gap-3">
        {/* Chat List */}
        <div className="messenger-left text-left">
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  setVisibleUserIndex(
                    visibleUserIndex === index ? null : index
                  );
                }}
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
                      {chat?.lastMessage?.content ?? "No message"}
                    </p>
                  </div>
                  {chat.unreadCount! > 0 && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                {visibleUserIndex === index && (
                  <div className="action-buttons">
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
          }`}
        >
          {currentRoomId && currentChat && (
            <Chat
              key={currentRoomId}
              roomId={currentRoomId}
              otherUser={currentChat.otherUser}
              otherUserAccount={currentChat.otherUserAccount}
              messages={messages}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Messenger;
