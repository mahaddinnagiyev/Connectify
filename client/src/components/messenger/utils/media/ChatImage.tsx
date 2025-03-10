import { useState } from "react";
import { Modal, Box, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";

const ChatImage = ({ message }: { message: MessagesDTO }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  if (message.message_type !== MessageType.IMAGE) return null;

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

      if (!response.ok) throw new Error("Failed to download image");

      const blob = await response.blob();

      const image_url = message.content;
      const image_name = image_url.split("/").pop();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = image_name ?? "image.jpg";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Image download failed");
    }
    handleCloseContextMenu();
  };

  return (
    <>
      <img
        src={message.content}
        alt=""
        className="bg-white rounded-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
        onContextMenu={handleContextMenu}
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
            <DownloadIcon /> Download Image
          </Button>
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
