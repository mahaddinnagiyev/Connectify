import { useState, useEffect, useRef } from "react";
import "./chat-style.css";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import { Tooltip } from "@mui/material";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Users } from "../../services/user/dto/user-dto";
import no_profile_photo from "../../assets/no-profile-photo.png";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VideocamIcon from "@mui/icons-material/Videocam";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { socket } from "../../services/socket/socket-service";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettings } from "../../services/account/dto/privacy-settings-dto";
import { getAllFriendshipRequests } from "../../services/friendship/friendship-service";
import { FriendshipStatus } from "../../services/friendship/enum/friendship-status.enum";
import { Link } from "react-router-dom";

interface ChatProps {
  roomId: string;
  otherUser?: Users;
  otherUserAccount?: Account;
  messages: MessagesDTO[];
}

interface LastSeenProps {
  otherUserAccount: Account;
  otherUserId: string;
}

const LastSeen = ({ otherUserAccount, otherUserId }: LastSeenProps) => {
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (otherUserAccount.privacy!.last_login === PrivacySettings.my_friends) {
      getAllFriendshipRequests()
        .then((response) => {
          if (response.success) {
            const acceptedFriend = response.friends.find(
              (friend) =>
                (friend.friend_id === otherUserId ||
                  friend.id === otherUserId) &&
                friend.status === FriendshipStatus.accepted
            );
            setIsFriend(!!acceptedFriend);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [otherUserAccount, otherUserId]);

  if (otherUserAccount.privacy!.last_login === PrivacySettings.everyone) {
    return (
      <p className="text-xs">
        Last seen at:{" "}
        {otherUserAccount?.last_login
          ? new Date(otherUserAccount.last_login).toLocaleString("az-AZ", {
              timeZone: "Asia/Baku",
            })
          : "N/A"}
      </p>
    );
  }

  if (otherUserAccount.privacy!.last_login === PrivacySettings.my_friends) {
    if (loading) {
      return <p className="text-xs">Loading last seen...</p>;
    }
    return isFriend ? (
      <p className="text-xs">
        Last seen at:{" "}
        {otherUserAccount?.last_login
          ? new Date(otherUserAccount.last_login).toLocaleString("az-AZ", {
              timeZone: "Asia/Baku",
            })
          : "N/A"}
      </p>
    ) : (
      <p className="text-xs">Last seen at: N/A</p>
    );
  }

  if (otherUserAccount.privacy!.last_login === PrivacySettings.nobody) {
    return null;
  }

  return <p className="text-xs">Last seen at: N/A</p>;
};

const Chat = ({ roomId, otherUser, otherUserAccount, messages }: ChatProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [visibleChatOptions, setVisibleChatOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatOptionsRef = useRef<HTMLDivElement>(null);

  const screenSize = window.innerWidth;

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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      socket?.emit("sendMessage", {
        roomId: roomId,
        content: messageInput,
        message_type: "text",
      });
      setMessageInput("");
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const groupMessagesByDate = (messages: MessagesDTO[]) => {
    const groupedMessages: { [key: string]: MessagesDTO[] } = {};

    const formatDate = (date: string) => {
      const messageDate = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return "Today";
      }
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      return messageDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    messages.forEach((message) => {
      const formattedDate = formatDate(new Date(message.created_at).toString());

      if (!groupedMessages[formattedDate]) {
        groupedMessages[formattedDate] = [];
      }

      groupedMessages[formattedDate].push(message);
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      {/* Header */}
      <div className="right-header pb-2 px-4 flex items-center justify-between max-h-[57px]">
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
                <button className="user-profile-btn">
                  <AccountBoxIcon className="profile-icon" /> User Profile
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
                <button className="block-btn">
                  <BlockIcon /> Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="font-bold" />
      {/* Messages Section */}
      <section className="chat">
        <div className="messages-container" ref={messagesContainerRef}>
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <>
              <div className="message-date w-full text-center text-sm border-y-2 border-[var(--primary-color)] my-2 py-2">
                {date}
              </div>
              {Array.isArray(messages) &&
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender_id === otherUser?.id &&
                      message.message_type !== MessageType.DEFAULT
                        ? "sender"
                        : message.message_type === MessageType.DEFAULT
                        ? "default"
                        : "receiver"
                    }`}
                  >
                    <p className="message-text">{message.content}</p>
                    {message.message_type !== MessageType.DEFAULT && (
                      <span className="message-time">
                        {new Date(message.created_at + "Z").toLocaleTimeString(
                          "az-AZ",
                          {
                            timeZone: "Asia/Baku",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    )}
                  </div>
                ))}
            </>
          ))}
        </div>
        {/* Send Message Form */}
        <div className="send-message-container mt-2">
          <Tooltip title="Emotes" placement="top">
            <button className="insert-emoticon-button">
              <InsertEmoticonIcon />
            </button>
          </Tooltip>
          <Tooltip title="Attach File" placement="top">
            <button className="attach-file-button">
              <AttachFileIcon />
            </button>
          </Tooltip>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          ></textarea>
          <button
            type="submit"
            className="send-button"
            onClick={handleSendMessage}
          >
            <SendIcon />
          </button>
        </div>
      </section>
    </>
  );
};

export default Chat;
