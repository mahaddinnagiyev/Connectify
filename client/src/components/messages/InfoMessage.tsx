import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import { styled, keyframes } from "@mui/system";

interface InfoMessageProps {
  message: string;
  onClose: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const MessageContainer = styled("div")<{ exiting: boolean }>(({ exiting }) => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "350px",
  zIndex: 9999,
  animation: exiting
    ? `${slideOut} 0.5s ease-in forwards`
    : `${slideIn} 0.5s ease-out forwards`,
}));

const CustomAlert = styled(Alert)({
  padding: "20px 25px",
  minHeight: "80px",
  display: "flex",
  alignItems: "center",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  fontSize: "16px",
  "& .MuiAlert-icon": {
    fontSize: "28px",
    marginRight: "15px",
  },
});

const InfoMessage: React.FC<InfoMessageProps> = ({ message, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <MessageContainer exiting={exiting}>
      <CustomAlert variant="filled" severity="info" onClose={onClose}>
        {message}
      </CustomAlert>
    </MessageContainer>
  );
};

export default InfoMessage;
