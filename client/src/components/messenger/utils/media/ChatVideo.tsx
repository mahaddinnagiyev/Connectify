import { useState } from "react";
import { Modal, Box, Button } from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  TurnLeft as TurnLeftIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import VideoPlayer from "./VideoPlayer";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";
import ErrorMessage from "../../../messages/ErrorMessage";
import SuccessMessage from "../../../messages/SuccessMessage";

interface ChatVideoProps {
  message: MessagesDTO;
  currentUser?: string;
  isInModal?: boolean;
  onLoadedData?: () => void;
  handleReplyMessage?: (message: MessagesDTO | null) => void;
  handleUnsendMessage?: (messageId: string | undefined) => void;
}

const ChatVideo = ({
  message,
  currentUser,
  isInModal = false,
  onLoadedData,
  handleReplyMessage,
  handleUnsendMessage,
}: ChatVideoProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    message?: MessagesDTO;
  } | null>(null);

  if (message.message_type !== MessageType.VIDEO) return null;

  const handleContextMenu = (event: React.MouseEvent, message: MessagesDTO) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      message,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(message.content);
      if (!response.ok) throw new Error("Failed to download video");

      const blob = await response.blob();

      const video_url = message.content;
      const video_name = video_url.split("/").pop();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `connectify/${video_name}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("Video downloaded successfully");
    } catch {
      setErrorMessage("Download failed. Please try again later.");
    }
    handleCloseContextMenu();
  };

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

      <Box
        sx={{
          position: "relative",
          cursor: "pointer",
          maxWidth: "95vw",
          maxHeight: isInModal ? "155px" : "auto",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => setIsModalOpen(true)}
        onContextMenu={(e) => handleContextMenu(e, message)}
      >
        <video
          src={message.content}
          style={{
            width: "100%",
            display: "block",
            height: isInModal ? "100%" : "auto",
            objectFit: isInModal ? "contain" : "contain",
            objectPosition: "center",
          }}
          muted
          playsInline
          onLoadedData={onLoadedData}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#00ff00",
          }}
        >
          <PlayArrowIcon
            sx={{
              fontSize: 48,
              border: "3px solid var(--primary-color)",
              borderRadius: "50%",
            }}
          />
        </Box>
      </Box>

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
                width: "200px",
                zIndex: 1300,
              }}
              onMouseLeave={handleCloseContextMenu}
            >
              <Button
                onClick={handleDownload}
                style={{
                  color: "var(--primary-color) !important",
                  fontWeight: 600,
                  padding: "10px",
                  textTransform: "none",
                  width: "100%",
                }}
              >
                <DownloadIcon /> Download Video
              </Button>
              {isInModal === false && (
                <Button
                  onClick={() => handleReplyMessage!(contextMenu.message!)}
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
              )}
              {currentUser === message.sender_id && (
                <Button
                  onClick={() => handleUnsendMessage!(contextMenu.message?.id)}
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

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90%",
            maxWidth: "90vw",
            outline: "none",
          }}
        >
          <VideoPlayer
            message={message}
            handleDownload={handleDownload}
            onClose={() => setIsModalOpen(false)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ChatVideo;
