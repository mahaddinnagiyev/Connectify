import { useState } from "react";
import { Modal, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideoPlayer from "./VideoPlayer";
import {
  MessagesDTO,
  MessageType,
} from "../../../../services/socket/dto/messages-dto";

const ChatVideo = ({ message }: { message: MessagesDTO }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (message.message_type !== MessageType.VIDEO) return null;

  return (
    <>
      <Box
        sx={{
          position: "relative",
          cursor: "pointer",
          maxWidth: "95vw",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <video
          src={message.content}
          style={{ width: "100%", display: "block", maxHeight: "90vh" }}
          muted
          playsInline
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
            onClose={() => setIsModalOpen(false)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ChatVideo;
