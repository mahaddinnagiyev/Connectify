import { useState } from "react";
import { Modal, Box, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import VideoPlayer from "./VideoPlayer";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";
import ErrorMessage from "../../../messages/ErrorMessage";
import SuccessMessage from "../../../messages/SuccessMessage";

const ChatVideo = ({
  message,
  onLoadedData,
}: {
  message: MessagesDTO;
  onLoadedData: () => void;
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  if (message.message_type !== MessageType.VIDEO) return null;

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
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
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => setIsModalOpen(true)}
        onContextMenu={handleContextMenu}
      >
        <video
          src={message.content}
          style={{ width: "100%", display: "block", maxHeight: "90vh" }}
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

      {contextMenu !== null && (
        <Box
          sx={{
            position: "fixed",
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            backgroundColor: "white",
            boxShadow: 3,
            borderRadius: "4px",
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
            }}
          >
            <DownloadIcon /> Download Video
          </Button>
        </Box>
      )}

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
