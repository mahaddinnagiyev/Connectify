import { useState, useEffect, useRef } from "react";
import "./css/chat-style.css";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Users } from "../../services/user/dto/user-dto";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  FolderZip as FolderZipIcon,
  Slideshow as SlideshowIcon,
  GridOn as GridOnIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from "@mui/icons-material";
import { socket } from "../../services/socket/socket-service";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import ErrorMessage from "../messages/ErrorMessage";
import {
  get_block_list,
  get_blocker_list,
} from "../../services/user/block-list-service";
import SendMessage from "./SendMessage";
import AudioPlayer from "./utils/audio/AudioPlayer";
import ChatHeader from "./utils/chat/ChatHeader";
import ChatImage from "./utils/media/ChatImage";
import ChatVideo from "./utils/media/ChatVideo";

interface ChatProps {
  roomId: string;
  currentUser: string;
  otherUser?: Users;
  otherUserAccount?: Account;
  otherUserPrivacySettings?: PrivacySettingsDTO;
  messages: MessagesDTO[];
}

const Chat = ({
  roomId,
  currentUser,
  otherUser,
  otherUserAccount,
  otherUserPrivacySettings,
  messages,
}: ChatProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    get_block_list().then((response) => {
      if (response.success) {
        const blockedUsers = response.blockList.map((user) => user.id);
        setIsBlocked(blockedUsers.includes(otherUser!.id));
      }
    });

    get_blocker_list().then((response) => {
      if (response.success) {
        const blockUsers = response.blockerList.map((user) => user.id);
        setIsBlocker(blockUsers.includes(otherUser!.id));
      }
    });
  }, [otherUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiPicker = (emojiObject: { emoji: string }) => {
    setMessageInput((prevInput) => prevInput + emojiObject.emoji);
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

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    if (!fileName) {
      return <InsertDriveFileIcon sx={{ color: "#757575" }} />;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon sx={{ color: "#FF0000", fontSize: "36px" }} />;
      case "doc":
      case "docx":
        return <DescriptionIcon sx={{ color: "#2B579A", fontSize: "36px" }} />;
      case "xls":
      case "xlsx":
        return <TableChartIcon sx={{ color: "#217346", fontSize: "36px" }} />;
      case "zip":
      case "rar":
        return <FolderZipIcon sx={{ color: "#FFA500", fontSize: "36px" }} />;
      case "pptx":
      case "ppt":
        return <SlideshowIcon sx={{ color: "#D24726", fontSize: "36px" }} />;
      case "csv":
        return <GridOnIcon sx={{ color: "#1E6E42", fontSize: "36px" }} />;
      default:
        return (
          <InsertDriveFileIcon sx={{ color: "#757575", fontSize: "36px" }} />
        );
    }
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Header */}
      <div className="right-header pb-2 pr-4 flex items-center justify-between max-h-[57px]">
        <ChatHeader
          otherUserAccount={otherUserAccount!}
          otherUserPrivacySettings={otherUserPrivacySettings!}
          otherUser={otherUser!}
        />
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
                    {message.message_type === MessageType.IMAGE && (
                      <ChatImage message={message} />
                    )}
                    {message.message_type === MessageType.VIDEO && (
                      <ChatVideo
                        message={message}
                        onLoadedData={scrollToBottom}
                      />
                    )}
                    {message.message_type === MessageType.FILE && (
                      <div className="file-message-container">
                        <div className="doc-file-icon">
                          {getFileIcon(message.message_name)}
                        </div>
                        <div className="doc-file-info">
                          <a
                            href={message.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-name"
                            title={message.message_name || "Download File"}
                          >
                            {message.message_name || "Download File"}
                          </a>
                          <span className="file-size">
                            Size: {formatFileSize(Number(message.message_size))}
                          </span>
                        </div>
                      </div>
                    )}

                    {message.message_type === MessageType.AUDIO && (
                      <div className="audio-player-container">
                        <AudioPlayer
                          src={message.content}
                          onLoadedData={scrollToBottom}
                        />
                      </div>
                    )}

                    {message.message_type === MessageType.TEXT && (
                      <p className="message-text px-1">{message.content}</p>
                    )}
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
        <SendMessage
          isBlocked={isBlocked}
          isBlocker={isBlocker}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleSendMessage={handleSendMessage}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiPickerRef={emojiPickerRef}
          handleEmojiPicker={handleEmojiPicker}
          roomId={roomId}
          currentUser={currentUser}
          socket={socket}
          otherUserUsername={otherUser?.username}
        />
      </section>
    </>
  );
};

export default Chat;
