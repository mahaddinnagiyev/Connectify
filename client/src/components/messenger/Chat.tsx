import { useState } from "react";
import "./chat-style.css";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import { Tooltip } from "@mui/material";
import { MessagesDTO } from "../../services/socket/dto/messages-dto";
import { Users } from "../../services/user/dto/user-dto";
import no_profile_photo from "../../assets/no-profile-photo.png";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VideocamIcon from "@mui/icons-material/Videocam";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import { socket } from "../../services/socket/socket-service";
import { Account } from "../../services/account/dto/account-dto";

interface ChatProps {
  roomId: string;
  otherUser?: Users;
  otherUserAccount?: Account;
  messages: MessagesDTO[];
}

const Chat = ({ roomId, otherUser, otherUserAccount, messages }: ChatProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [visibleChatOptions, setVisibleChatOptions] = useState(false);

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

  const toggleChatOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleChatOptions(!visibleChatOptions);
  };

  return (
    <>
      {/* Header */}
      <div className="right-header pb-3 px-4 max-h-[55px] flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            src={otherUserAccount?.profile_picture ?? no_profile_photo}
            alt=""
            width={50}
            height={40}
            className="rounded-full border-2 border-[var(--primary-color)]"
          />
          <div>
            <p className="text-sm mb-1">
              {otherUser?.first_name} {otherUser?.last_name} | @
              {otherUser?.username}{" "}
            </p>
            <p className="text-xs">
              Last seen at:{" "}
              {new Date(otherUserAccount?.last_login ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-1 items-center mr-3">
          <div>
            <button className="call-btn">
              <LocalPhoneIcon />
            </button>
          </div>
          <div>
            <button className="call-btn">
              <VideocamIcon />
            </button>
          </div>
          <div>
            <button onClick={toggleChatOptions}>
              <MoreVertIcon />
            </button>
            {visibleChatOptions && (
              <div className="action-buttons-2">
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
          </div>
        </div>
      </div>
      <hr className="font-bold" />

      {/* Messages */}
      <section className="chat">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender_id === otherUser?.id ? "sender" : "receiver"
              }`}
            >
              <p className="message-text">{message.content}</p>
              <span className="message-time">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
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
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
