import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./css/chat-style.css";
import { Box, Button } from "@mui/material";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import ReplyIcon from "@mui/icons-material/Reply";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Users } from "../../services/user/dto/user-dto";
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
import ChatFile from "./utils/media/ChatFile";
import SuccessMessage from "../messages/SuccessMessage";

interface ChatProps {
  roomId: string;
  currentUser: string;
  otherUser?: Users;
  otherUserAccount?: Account;
  otherUserPrivacySettings?: PrivacySettingsDTO;
  messages: MessagesDTO[];
  truncateMessage: (message: string, maxLength: number) => string;
}

const Chat = ({
  roomId,
  currentUser,
  otherUser,
  otherUserAccount,
  otherUserPrivacySettings,
  messages,
  truncateMessage,
}: ChatProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    message?: MessagesDTO;
  } | null>(null);
  const [allMessages, setAllMessages] = useState<MessagesDTO[]>(messages);
  const [replyMessage, setReplyMessage] = useState<MessagesDTO | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [successMessage, setSuccessMessage] = useState<string | null>("");

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllMessages(messages);
  }, [messages]);

  useEffect(() => {
    get_block_list().then((response) => {
      if (response.success && otherUser) {
        const blockedUsers = response.blockList.map((user) => user.id);
        setIsBlocked(blockedUsers.includes(otherUser.id));
      }
    });

    get_blocker_list().then((response) => {
      if (response.success && otherUser) {
        const blockUsers = response.blockerList.map((user) => user.id);
        setIsBlocker(blockUsers.includes(otherUser.id));
      }
    });
  }, [otherUser]);

  useEffect(() => {
    const handleMessageUnsent = (data: { messageId: string }) => {
      setAllMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== data.messageId)
      );
    };

    socket?.on("messageUnsent", handleMessageUnsent);
    return () => {
      socket?.off("messageUnsent", handleMessageUnsent);
    };
  }, []);

  const handleReplyMessage = useCallback((message: MessagesDTO | null) => {
    setReplyMessage(message);

    (
      document.getElementsByClassName("message-input")[0] as HTMLElement
    ).focus();

    handleCloseContextMenu();
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, message: MessagesDTO) => {
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        message,
      });
    },
    []
  );

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleUnsendMessage = useCallback(
    (messageId: string | undefined) => {
      if (!messageId) return;
      socket?.emit("unsendMessage", { roomId, messageId });
      setContextMenu(null);
    },
    [roomId]
  );

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const copyMessage = useCallback((message: MessagesDTO) => {
    if (message.message_type === MessageType.TEXT) {
      navigator.clipboard.writeText(message.content);
      setSuccessMessage("Message copied to clipboard");
      handleCloseContextMenu();
    }
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [allMessages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const groupedMessages = useMemo(() => {
    const grouped: { [key: string]: MessagesDTO[] } = {};

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

    for (const message of allMessages) {
      const formattedDate = formatDate(
        new Date(message.created_at + "Z").toString()
      );
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      grouped[formattedDate].push(message);
    }
    return grouped;
  }, [allMessages]);

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Header */}
      <div className="right-header pb-2 pr-4 flex items-center justify-between max-h-[57px]">
        <ChatHeader
          otherUserAccount={otherUserAccount!}
          otherUserPrivacySettings={otherUserPrivacySettings!}
          otherUser={otherUser!}
          messages={allMessages}
          socket={socket!}
          roomId={roomId}
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
              {messages.map((message, index) => (
                <>
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
                    onContextMenu={
                      ![
                        MessageType.IMAGE,
                        MessageType.DEFAULT,
                        MessageType.VIDEO,
                        MessageType.FILE,
                      ].includes(message.message_type)
                        ? (e) => handleContextMenu(e, message)
                        : undefined
                    }
                  >
                    {message.is_parent_deleted ? (
                      <div className="parent-message-container">
                        <div className="parent-message">
                          <div className="parent-message-content">
                            <span className="text-preview">
                              This message was deleted
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.parent_message_id && (
                          <div className="parent-message-container">
                            <div className="parent-message">
                              <div className="parent-message-header">
                                <span className="parent-message-icon">↩</span>
                                <span className="parent-message-username">
                                  {message.parent_message_id.sender_id ===
                                  currentUser
                                    ? "You"
                                    : otherUser?.username}
                                </span>
                              </div>
                              <div className="parent-message-content">
                                {message.parent_message_id.message_type ===
                                MessageType.TEXT ? (
                                  <span className="text-preview">
                                    {truncateMessage(
                                      message.parent_message_id.content,
                                      50
                                    )}
                                  </span>
                                ) : message.parent_message_id.message_type ===
                                  MessageType.IMAGE ? (
                                  <span className="media-preview">🖼 Image</span>
                                ) : message.parent_message_id.message_type ===
                                  MessageType.VIDEO ? (
                                  <span className="media-preview">
                                    🎬 Video
                                  </span>
                                ) : message.parent_message_id.message_type ===
                                  MessageType.FILE ? (
                                  <span className="file-preview">
                                    📎{" "}
                                    {message.parent_message_id.message_name ??
                                      "Imported File"}
                                  </span>
                                ) : message.parent_message_id.message_type ===
                                  MessageType.AUDIO ? (
                                  <>
                                    <span className="audio-preview">
                                      🎵 {"Audio"}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-preview">
                                    {truncateMessage(
                                      message.parent_message_id.content,
                                      150
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {message.message_type === MessageType.IMAGE && (
                      <ChatImage
                        message={message}
                        currentUser={currentUser}
                        handleReplyMessage={handleReplyMessage}
                        handleUnsendMessage={handleUnsendMessage}
                        onLoadedData={scrollToBottom}
                      />
                    )}
                    {message.message_type === MessageType.VIDEO && (
                      <ChatVideo
                        message={message}
                        currentUser={currentUser}
                        onLoadedData={scrollToBottom}
                        handleReplyMessage={handleReplyMessage}
                        handleUnsendMessage={handleUnsendMessage}
                      />
                    )}
                    {message.message_type === MessageType.FILE && (
                      <ChatFile
                        message={message}
                        currentUser={currentUser}
                        handleReplyMessage={handleReplyMessage}
                        handleUnsendMessage={handleUnsendMessage}
                        onLoadedData={scrollToBottom}
                      />
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
                      <>
                        <p className="message-text px-1">
                          {isValidUrl(message.content) ? (
                            <a
                              href={message.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {message.content}
                            </a>
                          ) : (
                            message.content
                          )}
                        </p>
                      </>
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
                </>
              ))}
            </>
          ))}
        </div>

        {contextMenu !== null &&
          (() => {
            const menuWidth = 200;
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
                  onClick={() => handleReplyMessage(contextMenu.message!)}
                  style={{
                    color: "var(--primary-color)",
                    fontWeight: 600,
                    padding: "10px",
                    textTransform: "none",
                    width: "100%",
                  }}
                >
                  <ReplyIcon /> Reply
                </Button>
                {contextMenu.message?.message_type === MessageType.TEXT && (
                  <Button
                    onClick={() => copyMessage(contextMenu.message!)}
                    style={{
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      padding: "10px",
                      textTransform: "none",
                      width: "100%",
                      display: "flex",
                      gap: "3px",
                    }}
                  >
                    <ContentCopyIcon fontSize="small" /> Copy Message
                  </Button>
                )}
                {contextMenu.message?.sender_id === currentUser && (
                  <Button
                    onClick={() => handleUnsendMessage(contextMenu.message?.id)}
                    style={{
                      color: "red",
                      fontWeight: 600,
                      padding: "10px",
                      textTransform: "none",
                      width: "100%",
                    }}
                  >
                    <TurnLeftIcon className="pb-1" /> Unsend
                  </Button>
                )}
              </Box>
            );
          })()}

        {/* Send Message Form */}
        <SendMessage
          isBlocked={isBlocked}
          isBlocker={isBlocker}
          roomId={roomId}
          currentUser={currentUser}
          socket={socket}
          otherUserUsername={otherUser?.username}
          handleReplyMessage={handleReplyMessage}
          replyMessage={replyMessage}
          truncateMessage={truncateMessage}
          setAllMessages={setAllMessages}
          allMessages={allMessages}
        />
      </section>
    </>
  );
};

export default Chat;
