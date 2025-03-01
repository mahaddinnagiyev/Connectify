import React, { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import { styled, keyframes } from "@mui/system";

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const MessageContainer = styled("div")<{ isExiting: boolean }>(
  ({ isExiting }) => ({
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "350px",
    zIndex: 9999,
    animation: `${isExiting ? slideOut : slideIn} 0.5s ease-in-out forwards`,
  })
);

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
  color: "#fff",
  "& .MuiAlert-message": {
    color: "#fff",
  },
});

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 500);
  }, [onClose, setIsExiting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <MessageContainer isExiting={isExiting}>
      <CustomAlert variant="filled" severity="success" onClose={handleClose}>
        {message}
      </CustomAlert>
    </MessageContainer>
  );
};

export default SuccessMessage;
