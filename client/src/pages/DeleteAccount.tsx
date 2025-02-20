import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { confirm_delete_account } from "../services/auth/auth-service";

const DeleteAccount: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      confirm_delete_account(token)
        .then((response) => {
          if (response.success) {
            setMessage(
              "We're really sorry to see you go. Your account has been deleted successfully. We hope to welcome you back one day. If you ever change your mind, you know where to find us. Take care, and see you later! 👋 😊"
            );
          } else {
            setMessage(
              response.error || "Failed to delete account. Please try again."
            );
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setMessage("An error occurred. Please try again later.");
          setLoading(false);
        });
    } else {
      setMessage("Invalid token.");
      setLoading(false);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      {loading ? (
        <CircularProgress
          sx={{
            color: "#fff",
            "&.MuiCircularProgress-root": {
              width: "60px !important",
              height: "60px !important",
            },
          }}
        />
      ) : (
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
            p: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            transform: "translateY(0)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                animation: "scaleUp 0.5s ease",
                "@keyframes scaleUp": {
                  "0%": { transform: "scale(0)" },
                  "80%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 80,
                  color: "#fff",
                  mb: 2,
                  p: 1.5,
                  bgcolor: "success.main",
                  borderRadius: "50%",
                  boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                }}
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(45deg, #2e7d32 30%, #00ff00 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Goodbye!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: "1.1rem",
                color: "#616161",
                lineHeight: 1.6,
                mb: 3,
                position: "relative",
                "&::after": {
                  content: '""',
                  display: "block",
                  width: "50px",
                  height: "2px",
                  bgcolor: "#4caf50",
                  margin: "20px auto 0",
                  borderRadius: "2px",
                },
              }}
            >
              {message}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", mt: 1 }}>
            <Typography
              sx={{
                background: "var(--primary-color)",
                borderRadius: "25px",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(25, 118, 210, 0.2)",
                transition: "all 1s ease-in-out",
                color: "#fff",
              }}
            >
              Connectify Team
            </Typography>
          </CardActions>
        </Card>
      )}
    </Box>
  );
};

export default DeleteAccount;
