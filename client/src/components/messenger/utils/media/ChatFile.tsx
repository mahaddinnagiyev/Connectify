import { useState } from "react";
import { Box, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  FolderZip as FolderZipIcon,
  Slideshow as SlideshowIcon,
  GridOn as GridOnIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from "@mui/icons-material";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";
import ErrorMessage from "../../../messages/ErrorMessage";
import SuccessMessage from "../../../messages/SuccessMessage";

interface ChatFileProps {
  message: MessagesDTO;
}

const ChatFile = ({ message }: ChatFileProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  if (message.message_type !== MessageType.FILE) return null;

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

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();

      const file_url = message.content;
      const file_name = file_url.split("/").pop();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `connectify/${file_name}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("File downloaded successfully");
    } catch {
      setErrorMessage("Download failed. Please try again later.");
    }
    handleCloseContextMenu();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    if (!fileName) {
      return <InsertDriveFileIcon sx={{ color: "#757575" }} />;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon sx={{ color: "#FF0000", fontSize: "36px" }} />;
      case "doc":
      case "docx":
        return <DescriptionIcon sx={{ color: "#2B579A", fontSize: "36px" }} />;
      case "xls":
      case "xlsx":
        return <TableChartIcon sx={{ color: "#217346", fontSize: "36px" }} />;
      case "zip":
      case "rar":
        return <FolderZipIcon sx={{ color: "#FFA500", fontSize: "36px" }} />;
      case "pptx":
      case "ppt":
        return <SlideshowIcon sx={{ color: "#D24726", fontSize: "36px" }} />;
      case "csv":
        return <GridOnIcon sx={{ color: "#1E6E42", fontSize: "36px" }} />;
      default:
        return (
          <InsertDriveFileIcon sx={{ color: "#757575", fontSize: "36px" }} />
        );
    }
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

      <div className="file-message-container" onContextMenu={handleContextMenu}>
        <div className="doc-file-icon">{getFileIcon(message.message_name)}</div>
        <div className="doc-file-info">
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className="file-name"
            title={message.message_name || "Download File"}
          >
            {message.message_name || "Download File"}
          </a>
          <span className="file-size">
            Size: {formatFileSize(Number(message.message_size))}
          </span>
        </div>
      </div>

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
            <DownloadIcon /> Download File
          </Button>
        </Box>
      )}
    </>
  );
};

export default ChatFile;
