import { useState, useEffect, useRef } from "react";
import "./css/chat-style.css";
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

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
                      <ChatFile message={message} />
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
