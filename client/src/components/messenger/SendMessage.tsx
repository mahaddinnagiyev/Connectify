import React, { useState, KeyboardEvent } from "react";
import { Tooltip } from "@mui/material";
import {
  Mic as MicIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import CheckModal from "../modals/spinner/CheckModal";
import ErrorMessage from "../messages/ErrorMessage";
import AttachModal from "../modals/chat/AttachModal";
import SelectedModal from "../modals/chat/SelectedModal";
import {
  uploadAudio,
  uploadFile,
  uploadImage,
  uploadVideo,
} from "../../services/socket/socket-service";
import { MessageType } from "../../services/socket/dto/messages-dto";
import { Socket } from "socket.io-client";
import AudioWaveAnimation from "./utils/AudioWaveAnimation";

interface SendMessageProps {
  isBlocked: boolean;
  isBlocker: boolean;
  messageInput: string;
  setMessageInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  handleEmojiPicker: (emoji: any, event?: any) => void;
  roomId: string;
  currentUser: string;
  socket: Socket | null;
  otherUserUsername?: string;
}

const SendMessage: React.FC<SendMessageProps> = ({
  isBlocked,
  isBlocker,
  messageInput,
  setMessageInput,
  handleSendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  handleEmojiPicker,
  roomId,
  currentUser,
  socket,
  otherUserUsername,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const onKeyPressHandler = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setShowAttachModal(false);
      setShowSelectedModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    let response: {
      success: boolean;
      message?: string;
      publicUrl?: string;
      message_name?: string;
      message_size?: number;
      error?: string;
      response?: { success: boolean; message?: string; error?: string };
    };
    const fileType = selectedFile.type;

    if (fileType.startsWith("image/")) {
      formData.append("message_image", selectedFile);
      response = await uploadImage(formData, roomId, currentUser);
    } else if (fileType.startsWith("video/")) {
      formData.append("message_video", selectedFile);
      response = await uploadVideo(formData, roomId, currentUser);
    } else if (
      fileType.startsWith("file/") ||
      fileType.startsWith("application/") ||
      fileType.startsWith("text/") ||
      fileType.startsWith("image/") ||
      fileType.startsWith("video/")
    ) {
      formData.append("message_file", selectedFile);
      response = await uploadFile(formData, roomId, currentUser);
    } else {
      setIsLoading(false);
      setErrorMessage("System doesn't support this type of file");
      return;
    }

    if (!response.success) {
      setIsLoading(false);
      setShowSelectedModal(false);
      setErrorMessage(
        response.response?.message ??
          response.response?.error ??
          response.message ??
          response.error ??
          "Failed To Upload"
      );
      return;
    }

    socket?.emit("sendMessage", {
      roomId: roomId,
      content: response.publicUrl,
      message_type: fileType.startsWith("image/")
        ? MessageType.IMAGE
        : fileType.startsWith("video/")
        ? MessageType.VIDEO
        : MessageType.FILE,
      message_name: response.message_name,
      message_size: Number(response.message_size),
    });

    setIsLoading(false);
    setShowSelectedModal(false);
    setSelectedFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        console.log(event.data);
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });

        await handleAudioUpload(audioFile);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleAudioUpload = async (audioFile: File) => {
    if (!audioFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("message_audio", audioFile);

    try {
      const response = await uploadAudio(formData, roomId, currentUser);

      if (!response.success) {
        setErrorMessage(
          response.response?.message ??
            response.response?.error ??
            response.message ??
            response.error ??
            "Failed To Upload"
        );
      }

      socket?.emit("sendMessage", {
        roomId: roomId,
        content: response.publicUrl,
        message_type: MessageType.AUDIO,
        message_name: audioFile.name,
        message_size: audioFile.size,
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage((error as Error).message || "Audio upload failed.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
  };

  return (
    <div className="send-message-wrapper">
      {isLoading && <CheckModal message="Uploading..." />}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="send-message-container mt-2">
        {isBlocked ? (
          <>
            <Tooltip title="Emotes" placement="top">
              <button
                className="insert-emoticon-button cursor-not-allowed"
                disabled
              >
                <InsertEmoticonIcon />
              </button>
            </Tooltip>
            <Tooltip title="Attach File" placement="top">
              <button
                className="attach-file-button cursor-not-allowed"
                disabled
              >
                <AttachFileIcon />
              </button>
            </Tooltip>
            <Tooltip
              title={`You have blocked ${otherUserUsername || "this user"}!`}
              placement="top"
            >
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="message-input cursor-not-allowed"
                onKeyPress={onKeyPressHandler}
                disabled
              ></textarea>
            </Tooltip>
            {messageInput.trim() ? (
              <button
                type="submit"
                className="send-button"
                style={{ cursor: "not-allowed" }}
                disabled
              >
                <SendIcon />
              </button>
            ) : (
              <button
                type="submit"
                className="send-button"
                style={{ cursor: "not-allowed" }}
                disabled
              >
                <MicIcon />
              </button>
            )}
          </>
        ) : isBlocker ? (
          <>
            <Tooltip title="Emotes" placement="top">
              <button
                className="insert-emoticon-button cursor-not-allowed"
                disabled
              >
                <InsertEmoticonIcon />
              </button>
            </Tooltip>
            <Tooltip title="Attach File" placement="top">
              <button
                className="attach-file-button cursor-not-allowed"
                disabled
              >
                <AttachFileIcon />
              </button>
            </Tooltip>
            <Tooltip
              title={`${otherUserUsername || "The user"} has blocked you!`}
              placement="top"
            >
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="message-input cursor-not-allowed"
                onKeyPress={onKeyPressHandler}
                disabled
              ></textarea>
            </Tooltip>
            {messageInput.trim() ? (
              <button
                type="submit"
                className="send-button"
                style={{ cursor: "not-allowed" }}
                disabled
              >
                <SendIcon />
              </button>
            ) : (
              <button
                type="submit"
                className="send-button"
                style={{ cursor: "not-allowed" }}
                disabled
              >
                <MicIcon />
              </button>
            )}
          </>
        ) : (
          <>
            {isRecording ? (
              <div className="recording-ui flex items-center md:gap-8 gap-3 w-full">
                <button
                  className="cancel-recording-button text-[red] border-2 border-[red] rounded-md p-2 hover:text-white hover:bg-[red] transition-all duration-300 ease-in-out"
                  onClick={cancelRecording}
                  title="Cancel Recording"
                >
                  <DeleteIcon />
                </button>
                <AudioWaveAnimation mediaRecorder={mediaRecorder!} />
                <button
                  type="submit"
                  className="send-button"
                  onClick={() => {
                    if (isRecording) {
                      cancelRecording();
                    } else {
                      handleSendMessage();
                    }
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            ) : (
              <>
                <Tooltip title="Emotes" placement="top">
                  <button
                    className="insert-emoticon-button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <InsertEmoticonIcon />
                  </button>
                </Tooltip>
                {showEmojiPicker && (
                  <div className="emoji-picker-container" ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={handleEmojiPicker} />
                  </div>
                )}
                <Tooltip title="Attach File" placement="top">
                  <button
                    className="attach-file-button"
                    onClick={() => setShowAttachModal(true)}
                  >
                    <AttachFileIcon />
                  </button>
                </Tooltip>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  onKeyPress={onKeyPressHandler}
                ></textarea>
                {messageInput.trim() ? (
                  <button
                    type="submit"
                    className="send-button"
                    onClick={handleSendMessage}
                  >
                    <SendIcon />
                  </button>
                ) : (
                  <Tooltip
                    title="Click to send a voice message"
                    placement="top"
                  >
                    <button
                      type="button"
                      className="send-button"
                      onClick={startRecording}
                    >
                      <MicIcon />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showAttachModal && (
        <AttachModal
          onClose={() => setShowAttachModal(false)}
          onSelectFile={handleFileSelect}
          onSelectVideo={handleFileSelect}
          onSelectImage={handleFileSelect}
        />
      )}

      {showSelectedModal && selectedFile && (
        <SelectedModal
          file={selectedFile}
          onClose={() => setShowSelectedModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default SendMessage;
