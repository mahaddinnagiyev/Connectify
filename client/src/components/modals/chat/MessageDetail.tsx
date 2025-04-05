import { useEffect, useState } from "react";
import { getMessageById } from "../../../services/socket/socket-service";
import {
  MessagesDTO,
  MessageType,
} from "../../../services/socket/dto/messages-dto";
import {
  InsertDriveFileOutlined as FileIcon,
  ImageOutlined as ImageIcon,
  MusicNoteOutlined as MusicIcon,
  VideocamOutlined as VideoIcon,
  Close as CloseIcon,
  TextFields as TextIcon,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import AudioPlayer from "../../messenger/utils/audio/AudioPlayer";
import { getToken } from "../../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";

interface MessageDetailProps {
  messageId: string;
  onClose: () => void;
}

const MessageDetail = ({ messageId, onClose }: MessageDetailProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<MessagesDTO | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();

      if (token) {
        const decodedToken: { id: string } = jwtDecode(token);
        setUserId(decodedToken.id);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await getMessageById(messageId);
        if (response.success) {
          setMessage(response.message);
        } else {
          setErrorMessage(
            response.response.message ??
              response.response.error ??
              response.error ??
              "Could not load message details"
          );
        }
      } catch (error) {
        if (error) {
          setErrorMessage("Could not load message details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [messageId]);

  const renderContent = () => {
    if (!message) return null;

    switch (message.message_type) {
      case MessageType.IMAGE:
        return (
          <img
            src={message.content}
            alt={message.message_name || "Image"}
            className="max-h-[70vh] w-auto rounded-lg object-contain shadow-lg"
          />
        );

      case MessageType.VIDEO:
        return (
          <video controls className="max-h-[70vh] w-full rounded-lg bg-black">
            <source src={message.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );

      case MessageType.AUDIO:
        return (
          <div className="w-full bg-[#1F2937] p-6 rounded-lg">
            <AudioPlayer src={message.content} />
          </div>
        );

      case MessageType.FILE:
        return (
          <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg">
            <FileIcon className="w-16 h-16 text-blue-500 mb-4" />
            <span>{message.message_name || "Imported file"}</span>
            {message.message_size && (
              <span className="text-sm text-gray-500 mt-2">
                {(message.message_size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl relative">
        {isLoading && (
          <div className="fixed inset-0 w-full h-full flex items-center justify-center">
            <CircularProgress
              size={30}
              style={{ color: "var(--primary-color)" }}
            />
            <span className="ml-2">Loading message details</span>
          </div>
        )}

        {errorMessage && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-red-500 text-center">{errorMessage}</div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            {message && message?.message_type === MessageType.TEXT && (
              <TextIcon className="w-5 h-5" />
            )}
            {message && message?.message_type === MessageType.IMAGE && (
              <ImageIcon className="w-5 h-5" />
            )}
            {message && message?.message_type === MessageType.VIDEO && (
              <VideoIcon className="w-5 h-5" />
            )}
            {message && message?.message_type === MessageType.AUDIO && (
              <MusicIcon className="w-5 h-5" />
            )}
            {message && message?.message_type === MessageType.FILE && (
              <FileIcon className="w-5 h-5" />
            )}
            <h3 className="text-lg font-semibold capitalize">
              {message && `${message?.message_type} Message`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 flex items-center justify-center min-h-[300px]">
          {renderContent()}
        </div>

        {/* Metadata */}
        {message && (
          <div className="p-4 border-t">
            <div className="space-y-2 text-sm">
              {message?.message_name && (
                <div className="flex gap-2">
                  <span className="font-medium">Name:</span>
                  <span className="text-gray-600">
                    {message && message.message_name}
                  </span>
                </div>
              )}

              {message?.message_size && (
                <div className="flex gap-2">
                  <span className="font-medium">Size:</span>
                  <span className="text-gray-600">
                    {message && (message.message_size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <span className="font-medium">Send Date:</span>
                <span className="text-gray-600">
                  {new Date(message!.created_at + "Z").toLocaleString("az-AZ")}
                </span>
              </div>

              {message?.sender_id === userId && (
                <div className="flex gap-2">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize text-gray-600">
                    {message && message?.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDetail;
