import React, { useEffect } from "react";
import Alert from "@mui/material/Alert";
import { styled, keyframes } from "@mui/system";

interface ErrorMessageProps {
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

const MessageContainer = styled("div")(() => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "350px",
  zIndex: 9999,
  animation: `${slideIn} 0.5s ease-out forwards`,
  "&.exiting": {
    animation: `${slideOut} 0.5s ease-in forwards`,
  },
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
  // Error üçün xüsusi stil
  backgroundColor: "#d32f2f",
  color: "#fff",
  "& .MuiAlert-message": {
    color: "#fff",
  },
});

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <MessageContainer>
      <CustomAlert variant="filled" severity="error" onClose={onClose}>
        {message}
      </CustomAlert>
    </MessageContainer>
  );
};

export default ErrorMessage;
