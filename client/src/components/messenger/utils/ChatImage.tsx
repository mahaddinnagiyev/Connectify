import { useState } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  MessagesDTO,
  MessageType,
} from "../../../services/socket/dto/messages-dto";

const ChatImage = ({ message }: { message: MessagesDTO }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (message.message_type !== MessageType.IMAGE) return null;

  return (
    <>
      <img
        src={message.content}
        alt=""
        className="bg-white rounded-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
      />

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
            <IconButton
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                color: "white",
              }}
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </IconButton>
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
