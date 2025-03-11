import { useState } from "react";
import { Modal, Box, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";
import ErrorMessage from "../../../messages/ErrorMessage";
import SuccessMessage from "../../../messages/SuccessMessage";

interface ChatImageProps {
  message: MessagesDTO;
  handleUnsendMessage: (messageId: string | undefined) => void;
  currentUser: string;
}

const ChatImage = ({
  message,
  handleUnsendMessage,
  currentUser,
}: ChatImageProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    messageId?: string;
  } | null>(null);

  if (message.message_type !== MessageType.IMAGE) return null;

  const handleContextMenu = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      messageId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(message.content);

      if (!response.ok) throw new Error("Failed to download image");

      const blob = await response.blob();

      const image_url = message.content;
      const image_name = image_url.split("/").pop();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `connectify/${image_name}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("Image downloaded successfully");
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

      <img
        src={message.content}
        alt=""
        className="bg-white rounded-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
        onContextMenu={(e) => handleContextMenu(e, message.id)}
      />

      {contextMenu !== null && (
        <Box
          sx={{
            position: "fixed",
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
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
            <DownloadIcon /> Download Image
          </Button>
          {currentUser === message.sender_id && (
            <Button
              onClick={() => handleUnsendMessage(contextMenu.messageId)}
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
      )}

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Box
          className="flex items-center justify-center"
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setIsOpen(false)}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "5px solid var(--primary-color)",
              borderRadius: "10px",
              backgroundColor: "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2">
              <IconButton
                sx={{ color: "var(--primary-color)" }}
                onClick={handleDownload}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                sx={{ color: "var(--primary-color)" }}
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <img
              src={message.content}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: "5px",
              }}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ChatImage;
