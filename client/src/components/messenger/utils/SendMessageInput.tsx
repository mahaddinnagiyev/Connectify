import React, { useEffect, useRef } from "react";
import { Tooltip } from "@mui/material";
import {
  Mic as MicIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import AudioWaveAnimation from "./audio/AudioWaveAnimation";

interface SendMessageInputProps {
  isBlocked: boolean;
  isBlocker: boolean;
  messageInput: string;
  isRecording: boolean;
  recordingTime: number;
  showEmojiPicker: boolean;
  mediaRecorder: MediaRecorder | null;
  otherUserUsername?: string;
  setMessageInput: (value: string) => void;
  setShowEmojiPicker: (value: boolean) => void;
  setShowAttachModal: (value: boolean) => void;
  handleSendMessage: () => void;
  startRecording: () => void;
  cancelRecording: () => void;
  stopRecordingAndUpload: () => void;
  onKeyPressHandler: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const formatRecordingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const DisabledInputSection = ({
  message,
  icon: Icon,
  ...props
}: {
  message: string;
  icon: React.ElementType;
} & React.HTMLAttributes<HTMLButtonElement>) => (
  <Tooltip title={message} placement="top">
    <button {...props} className="cursor-not-allowed" disabled>
      <Icon />
    </button>
  </Tooltip>
);

const ActiveInputSection = ({
  showPicker,
  onEmojiToggle,
  onAttach,
  emojiPickerRef,
  handleEmoji,
}: {
  showPicker: boolean;
  onEmojiToggle: () => void;
  onAttach: () => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  handleEmoji: (emoji: string) => void;
}) => (
  <>
    <Tooltip title="Emotes" placement="top">
      <button className="insert-emoticon-button" onClick={onEmojiToggle}>
        <InsertEmoticonIcon />
      </button>
    </Tooltip>
    {showPicker && (
      <div className="emoji-picker-container" ref={emojiPickerRef}>
        <EmojiPicker
          onEmojiClick={(emojiData) => handleEmoji(emojiData.emoji)}
        />
      </div>
    )}
    <Tooltip title="Attach File" placement="top">
      <button className="attach-file-button" onClick={onAttach}>
        <AttachFileIcon />
      </button>
    </Tooltip>
  </>
);

const RecordingUI = ({
  time,
  onCancel,
  onStop,
  mediaRecorder,
}: {
  time: number;
  onCancel: () => void;
  onStop: () => void;
  mediaRecorder: MediaRecorder | null;
}) => (
  <div className="recording-ui flex items-center md:gap-8 gap-3 w-full">
    <button
      className="cancel-recording-button text-[red] border-2 border-[red] rounded-md p-2 hover:text-white hover:bg-[red] transition-all duration-300 ease-in-out"
      onClick={onCancel}
      title="Cancel Recording"
    >
      <DeleteIcon />
    </button>
    <div className="recording-timer text-lg font-medium">
      {formatRecordingTime(time)}
    </div>
    <AudioWaveAnimation mediaRecorder={mediaRecorder!} />
    <button type="submit" className="send-button" onClick={onStop}>
      <SendIcon />
    </button>
  </div>
);

export const SendMessageInput = ({
  isBlocked,
  isBlocker,
  messageInput,
  isRecording,
  recordingTime,
  showEmojiPicker,
  mediaRecorder,
  otherUserUsername,
  setMessageInput,
  setShowEmojiPicker,
  setShowAttachModal,
  handleSendMessage,
  startRecording,
  cancelRecording,
  stopRecordingAndUpload,
  onKeyPressHandler,
}: SendMessageInputProps) => {
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const props = {
    placeholder: "Type a message...",
  };

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
  }, [setShowEmojiPicker]);

  const renderInputSection = () => {
    if (isBlocked || isBlocker) {
      const config = isBlocked
        ? {
            tooltip: `You have blocked ${otherUserUsername || "this user"}!`,
            buttons: [InsertEmoticonIcon, AttachFileIcon],
          }
        : {
            tooltip: `${otherUserUsername || "The user"} has blocked you!`,
            buttons: [InsertEmoticonIcon, AttachFileIcon],
          };

      return (
        <>
          {config.buttons.map((Icon, index) => (
            <DisabledInputSection
              key={index}
              message={Icon === InsertEmoticonIcon ? "Emotes" : "Attach File"}
              icon={Icon}
              className={
                Icon === InsertEmoticonIcon
                  ? "insert-emoticon-button"
                  : "attach-file-button"
              }
            />
          ))}

          <Tooltip title={config.tooltip} placement="top">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="message-input cursor-not-allowed"
              disabled
              {...props}
            />
          </Tooltip>

          <DisabledInputSection
            message={messageInput.trim() ? "Send Message" : "Start Recording"}
            icon={messageInput.trim() ? SendIcon : MicIcon}
            className="send-button"
          />
        </>
      );
    }

    if (isRecording) {
      return (
        <RecordingUI
          time={recordingTime}
          onCancel={cancelRecording}
          onStop={stopRecordingAndUpload}
          mediaRecorder={mediaRecorder}
        />
      );
    }

    return (
      <>
        <ActiveInputSection
          showPicker={showEmojiPicker}
          onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
          onAttach={() => setShowAttachModal(true)}
          emojiPickerRef={emojiPickerRef}
          handleEmoji={(emoji) => {
            setMessageInput(messageInput + emoji);
          }}
        />

        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="message-input"
          onKeyPress={onKeyPressHandler}
          {...props}
        />

        <Tooltip
          title={messageInput.trim() ? "Send Message" : "Start Recording"}
          placement="top"
        >
          <button
            className="send-button"
            onClick={messageInput.trim() ? handleSendMessage : startRecording}
          >
            {messageInput.trim() ? <SendIcon /> : <MicIcon />}
          </button>
        </Tooltip>
      </>
    );
  };

  return <div className="send-message-container">{renderInputSection()}</div>;
};
