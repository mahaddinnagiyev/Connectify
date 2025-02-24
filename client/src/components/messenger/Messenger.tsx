import { useState, useEffect } from "react";
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
import { MessagesDTO } from "../../services/socket/dto/messages-dto";
import { Account } from "../../services/account/dto/account-dto";

const Messenger = () => {
  const [visibleUserIndex, setVisibleUserIndex] = useState<number | null>(null);
  const [chats, setChats] = useState<
    (ChatRoomsDTO & { otherUser?: Users; otherUserAccount?: Account })[]
  >([]);
  const [messages, setMessages] = useState<MessagesDTO[]>([]);
  const [searchParams] = useSearchParams();
  const currentRoomId = searchParams.get("room");

  useEffect(() => {
    if (currentRoomId && chats.length > 0) {
      const currentChat = chats.find((chat) => chat.id === currentRoomId);
      if (currentChat?.otherUser?.id) {
        socket?.emit("joinRoom", { user2Id: currentChat.otherUser.id });
      }
    }
  }, [currentRoomId, chats]);

  useEffect(() => {
    const handleNewMessage = (newMessage: MessagesDTO) => {
      if (newMessage.room_id === currentRoomId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === newMessage.room_id
            ? { ...chat, lastMessage: newMessage.content }
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
                <div className="flex items-center gap-3">
                  <img
                    src={
                      chat.otherUserAccount?.profile_picture ?? no_profile_photo
                    }
                    alt="User Profile"
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-[var(--primary-color)]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      {chat.otherUser?.first_name} {chat.otherUser?.last_name} |
                      @{chat.otherUser?.username}
                    </p>
                    <p className="text-xs">
                      {chat?.lastMessage ?? "No message"}
                    </p>
                  </div>
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
              : "bg-[var(--secondary-color)] border-2 border-[var(--secondary-color)] rounded-lg"
          }`}
        >
          {currentRoomId && currentChat && (
            <Chat
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
