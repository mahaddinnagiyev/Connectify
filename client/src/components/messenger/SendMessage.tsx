import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { HighlightOff as HighlightOffIcon } from "@mui/icons-material";
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
import {
  MessagesDTO,
  MessageType,
} from "../../services/socket/dto/messages-dto";
import { Socket } from "socket.io-client";
import { SendMessageInput } from "./utils/SendMessageInput";

interface SendMessageProps {
  isBlocked: boolean;
  isBlocker: boolean;
  roomId: string;
  currentUser: string;
  socket: Socket | null;
  otherUserUsername?: string;
  replyMessage?: MessagesDTO | null;
  allMessages: MessagesDTO[];
  setAllMessages: (messages: MessagesDTO[]) => void;
  truncateMessage: (message: string, maxLength: number) => string;
  handleReplyMessage: (message: MessagesDTO | null) => void;
}

const SendMessage: React.FC<SendMessageProps> = ({
  isBlocked,
  isBlocker,
  roomId,
  currentUser,
  socket,
  truncateMessage,
  otherUserUsername,
  handleReplyMessage,
  allMessages,
  setAllMessages,
  replyMessage,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [prevMessages, setPrevMessages] = useState<MessagesDTO[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [recordingTime, setRecordingTime] = useState<number>(0);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const recordingCanceled = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      socket?.emit("sendMessage", {
        roomId: roomId,
        content: messageInput,
        message_type: "text",
        parent_message_id: replyMessage?.id,
      });
      setMessageInput("");
      setPrevMessages(allMessages);
      setAllMessages([...prevMessages]);
      handleReplyMessage(null);
    }
  };

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
    setPrevMessages(allMessages);
    setAllMessages([...prevMessages]);
    setSelectedFile(null);
  };

  const startRecording = async () => {
    let stream;
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (permissionStatus.state === "granted") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          setErrorMessage(
            "Microphone permission is required to record audio. Please grant the permission"
          );
          return;
        }
      }
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setErrorMessage(
          "Microphone permission is required to record audio. Please grant the permission"
        );
        return;
      }
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm; codecs=opus",
        audioBitsPerSecond: 192000,
      });
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (recordingCanceled.current) return;
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (recordingCanceled.current) {
          recordingCanceled.current = false;
          return;
        }
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm; codecs=opus",
        });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm; codecs=opus",
        });
        await handleAudioUpload(audioFile);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage(
        "Something went wrong while recording - Please try again later"
      );
    }
  };

  const stopRecordingAndUpload = () => {
    if (mediaRecorder) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      recordingCanceled.current = true;
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
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

  return (
    <div className="send-message-wrapper">
      {isLoading && <CheckModal message="Uploading..." />}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {replyMessage && (
        <div className="reply-message-container">
          <div className="reply-message">
            <div className="reply-message-header">
              <span className="reply-icon">↩</span>
              <span className="reply-username">
                {replyMessage.sender_id === currentUser
                  ? "You"
                  : otherUserUsername}
              </span>
            </div>
            <div className="reply-content">
              {replyMessage.message_type === MessageType.TEXT ? (
                <span className="text-preview">
                  {truncateMessage(replyMessage.content, 150)}
                </span>
              ) : replyMessage.message_type === MessageType.IMAGE ? (
                <span className="media-preview">🖼 Image</span>
              ) : replyMessage.message_type === MessageType.VIDEO ? (
                <span className="media-preview">🎬 Video</span>
              ) : replyMessage.message_type === MessageType.FILE ? (
                <span className="file-preview">
                  📎 {replyMessage.message_name ?? "Imported File"}
                </span>
              ) : replyMessage.message_type === MessageType.AUDIO ? (
                <span className="audio-preview">🎵 {"Audio"}</span>
              ) : (
                <span className="text-preview">
                  {truncateMessage(replyMessage.content, 150)}
                </span>
              )}
            </div>
          </div>
          <button
            className="cancel-reply"
            onClick={() => handleReplyMessage(null)}
          >
            <HighlightOffIcon />
          </button>
        </div>
      )}
      <SendMessageInput
        isBlocked={isBlocked}
        isBlocker={isBlocker}
        messageInput={messageInput}
        isRecording={isRecording}
        recordingTime={recordingTime}
        showEmojiPicker={showEmojiPicker}
        mediaRecorder={mediaRecorder}
        otherUserUsername={otherUserUsername}
        setMessageInput={setMessageInput}
        setShowEmojiPicker={setShowEmojiPicker}
        setShowAttachModal={setShowAttachModal}
        handleSendMessage={handleSendMessage}
        startRecording={startRecording}
        cancelRecording={cancelRecording}
        stopRecordingAndUpload={stopRecordingAndUpload}
        onKeyPressHandler={onKeyPressHandler}
      />

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
