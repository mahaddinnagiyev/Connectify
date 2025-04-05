import "./css/chat-style.css";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { keyframes } from "@emotion/react";
import { Box, Button, CircularProgress } from "@mui/material";
import {
  TurnLeft as TurnLeftIcon,
  Reply as ReplyIcon,
  ContentCopy as ContentCopyIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Users } from "../../services/user/dto/user-dto";
import { createSocket } from "../../services/socket/socket-service";
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
import React from "react";
import { Socket } from "socket.io-client";
import MessageDetail from "../modals/chat/MessageDetail";

interface ChatProps {
  roomId: string;
  currentUser: string;
  otherUser?: Users;
  otherUserAccount?: Account;
  otherUserPrivacySettings?: PrivacySettingsDTO;
  messages: MessagesDTO[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  hasMoreMessages: boolean;
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToBottom: () => void;
  truncateMessage: (message: string, maxLength: number) => string;
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

const Chat = ({
  roomId,
  currentUser,
  otherUser,
  otherUserAccount,
  otherUserPrivacySettings,
  messages,
  messagesContainerRef,
  hasMoreMessages,
  setHasMoreMessages,
  scrollToBottom,
  truncateMessage,
}: ChatProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    message?: MessagesDTO;
  } | null>(null);
  const [allMessages, setAllMessages] = useState<MessagesDTO[]>(messages);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [replyMessage, setReplyMessage] = useState<MessagesDTO | null>(null);

  const [newLimit, setNewLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const prevScrollHeight = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [successMessage, setSuccessMessage] = useState<string | null>("");

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  const handleOpenDetailModal = (messageId: string) => {
    handleCloseContextMenu();
    setSelectedMessageId(messageId);
  };

  const handleCloseDetailModal = () => {
    setSelectedMessageId(null);
  };

  useEffect(() => {
    const createSocketInstance = async () => {
      const socketInstance = await createSocket();
      setSocket(socketInstance ?? null);
    };

    createSocketInstance();
    const scrollToBottom = document.getElementById("scrollToBottom");
    scrollToBottom?.click();
  }, []);

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
    setAllMessages(messages);
  }, [messages]);

  useEffect(() => {
    get_block_list().then((response) => {
      if (response.success && otherUser) {
        const blockedUsers = response.blockList.map((user) => user.blocked_id);
        setIsBlocked(blockedUsers.includes(otherUser.id));
      }
    });

    get_blocker_list().then((response) => {
      if (response.success && otherUser) {
        const blockUsers = response.blockerList.map((user) => user.blocked_id);
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
  }, [socket]);

  useEffect(() => {
    if (messagesContainerRef.current && prevScrollHeight.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop =
        newScrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
    setIsLoading(false);
  }, [allMessages, messagesContainerRef]);

  const loadMoreMessages = useCallback(
    (newLimit: number) => {
      if (!isLoading && hasMoreMessages) {
        setIsLoading(true);
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
        socket?.emit("getMessages", { roomId, limit: newLimit });
        socket?.on("messages", (data) => {
          if (data.messages[0]?.room_id === roomId) {
            setAllMessages((prevMessages) => [
              ...data.messages,
              ...prevMessages,
            ]);
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
      }
    },
    [
      isLoading,
      hasMoreMessages,
      roomId,
      messagesContainerRef,
      socket,
      setHasMoreMessages,
    ]
  );

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
    [roomId, socket]
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
    const container = messagesContainerRef.current;
    if (!container) return;

    if (prevScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    } else {
      if (initialLoad && allMessages.length > 0) {
        container.scrollTop = container.scrollHeight;
        setInitialLoad(false);
      } else {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < 100) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, [allMessages, initialLoad, messagesContainerRef]);

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
          {isLoading && (
            <div className="w-full flex justify-center">
              <div className="text-xs text-[var(--primary-color)] bg-[var(--secondary-color)] p-2 rounded-md my-1 flex gap-2 items-center">
                <CircularProgress
                  size={17}
                  style={{ color: "var(--primary-color)" }}
                />{" "}
                Loading...
              </div>
            </div>
          )}
          <div className="w-full flex justify-center">
            {hasMoreMessages && !isLoading && (
              <button
                className="text-xs text-[var(--primary-color)] hover:underline bg-[var(--secondary-color)] p-2 rounded-md mt-2 my-1"
                onClick={() => {
                  const nextLimit = newLimit + 30;
                  setNewLimit(nextLimit);
                  loadMoreMessages(nextLimit);
                }}
              >
                See previous messages
              </button>
            )}
          </div>
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <React.Fragment key={date}>
              <div className="text-center text-sm my-2">
                <span className="border-[3px] border-[var(--primary-color)] py-2 px-4 rounded-full">
                  {date}
                </span>
              </div>
              {messages.map((message, index) => (
                <React.Fragment key={`${message.id}-${index}`}>
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
                        handleOpenDetailModal={handleOpenDetailModal}
                      />
                    )}
                    {message.message_type === MessageType.VIDEO && (
                      <ChatVideo
                        message={message}
                        currentUser={currentUser}
                        onLoadedData={scrollToBottom}
                        handleReplyMessage={handleReplyMessage}
                        handleUnsendMessage={handleUnsendMessage}
                        handleOpenDetailModal={handleOpenDetailModal}
                      />
                    )}
                    {message.message_type === MessageType.FILE && (
                      <ChatFile
                        message={message}
                        currentUser={currentUser}
                        handleReplyMessage={handleReplyMessage}
                        handleUnsendMessage={handleUnsendMessage}
                        onLoadedData={scrollToBottom}
                        handleOpenDetailModal={handleOpenDetailModal}
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
                    {message.message_type === MessageType.DEFAULT && (
                      <p className="text-xs p-1">{message.content}</p>
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
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>

        {contextMenu !== null &&
          (() => {
            const menuWidth = 200;
            const computedLeft =
              contextMenu.mouseX + menuWidth > window.innerWidth
                ? contextMenu.mouseX - menuWidth
                : contextMenu.mouseX;

            const menuHeight =
              contextMenu.message?.sender_id === currentUser ? 135 : 90;
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
                }}
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
                <Button
                  onClick={() => handleOpenDetailModal(contextMenu.message!.id)}
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
                  <InfoIcon /> Details
                </Button>

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
          scrollToBottom={scrollToBottom}
          messagesContainerRef={messagesContainerRef}
        />
      </section>

      {selectedMessageId && (
        <MessageDetail
          messageId={selectedMessageId}
          onClose={handleCloseDetailModal}
        />
      )}
    </>
  );
};

export default Chat;
