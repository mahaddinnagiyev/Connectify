import { Dialog, IconButton, CircularProgress, Button } from "@mui/material";
import { Close, CameraAlt, Replay } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  register_user_face_id,
  login_with_face_id,
} from "../../../services/auth/auth-service";
import { useLocation, useNavigate } from "react-router-dom";
import SuccessMessage from "../../messages/SuccessMessage";
import ErrorMessage from "../../messages/ErrorMessage";

export interface FaceIDModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  mode: "register" | "login";
  username_or_email_face_id?: string;
  userID?: string;
}

const FaceIDModal = ({
  onClose,
  onSuccess,
  mode,
  username_or_email_face_id,
  userID,
}: FaceIDModalProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/messenger";

  const success_audio = new Audio("/audio/successfull-face-id-audio.wav");

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models/face_recognition"
        );
      } catch (err) {
        if (err) {
          setError("Failed to load models.");
        }
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        if (err) {
          setError("Could not access camera.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        const displaySize = {
          width: videoRef.current.clientWidth,
          height: videoRef.current.clientHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const ctx = canvasRef.current.getContext("2d");
        if (detection) {
          const resizedDetection = faceapi.resizeResults(
            detection,
            displaySize
          );
          ctx?.clearRect(0, 0, displaySize.width, displaySize.height);
          faceapi.draw.drawDetections(canvasRef.current, [resizedDetection]);
        } else {
          ctx?.clearRect(0, 0, displaySize.width, displaySize.height);
        }
      }
    }, 500);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef!.current) {
        videoRef!.current.pause();
        videoRef!.current.srcObject = null;
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    faceapi.nets.tinyFaceDetector.dispose();
    faceapi.nets.faceLandmark68Net.dispose();
    faceapi.nets.faceRecognitionNet.dispose();

    onClose();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const captureFace = async () => {
    setIsCapturing(true);
    try {
      setIsProcessing(true);
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current as HTMLVideoElement,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) {
        setError("Face was not detected. Please try again.");
        setIsCapturing(false);
        return;
      }
      const descriptor = Array.from(detection.descriptor);

      if (mode === "register") {
        const response = await register_user_face_id(descriptor);
        if (response.success) {
          onSuccess("Face ID registered successfully.");
          handleClose();
          success_audio.play();

          const cacheKey = `cached_account_settings_${userID}`;
          const cachedData = localStorage.getItem(cacheKey);
          const parsedData = cachedData ? JSON.parse(cachedData) : null;
          if (parsedData && parsedData.settings && parsedData.settings.user) {
            parsedData.settings.user.face_descriptor = descriptor;
            localStorage.setItem(cacheKey, JSON.stringify(parsedData));
          }

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setError(
            response.message ?? response.error ?? "Face ID registration failed."
          );
        }
      } else if (mode === "login") {
        if (!username_or_email_face_id) {
          setError("Username or email is missing.");
          setIsCapturing(false);
          return;
        }
        const response = await login_with_face_id({
          username_or_email_face_id,
          face_descriptor: descriptor,
        });
        if (response.success) {
          onSuccess(response.message ?? "Face ID login successful.");
          handleClose();
          success_audio.play();
          localStorage.setItem(
            "successMessage",
            response.message ?? "Face ID login successful."
          );
          navigate(from, { replace: true });
        } else {
          setErrorMessage(
            response.response?.message ??
              response.response?.error ??
              response.message ??
              response.error ??
              "Face ID login failed."
          );
        }
      }
    } catch (err) {
      if (err) {
        setError("Something went wrong while capturing face.");
      }
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Dialog
        open={true}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "90%",
            maxWidth: "500px",
            borderRadius: "15px",
            bgcolor: "rgba(0, 15, 0, 0.9)",
            backdropFilter: "blur(10px)",
            border: "2px solid var(--primary-color)",
            boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
            overflow: "hidden",
          },
        }}
      >
        <div style={{ position: "relative", padding: "24px" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "var(--primary-color)",
            }}
          >
            <Close />
          </IconButton>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <CameraAlt sx={{ fontSize: 60, color: "var(--primary-color)" }} />
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "var(--primary-color)",
              }}
            >
              {error ? "Error" : "Face ID"}
            </h2>
          </div>
          {error && (
            <div style={{ color: "red", textAlign: "center", padding: "16px" }}>
              {error}
            </div>
          )}
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "2px solid #00ff0055",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            />
            <div className="text-[var(--primary-color)] text-center mt-2 font-bold">
              Wait until system detects your face
            </div>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.5)",
                }}
              >
                <CircularProgress sx={{ color: "#00ff00" }} />
                <span
                  style={{ color: "var(--primary-color)", marginTop: "8px" }}
                >
                  Accessing camera...
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
              gap: "16px",
            }}
          >
            {error && (
              <Button
                variant="outlined"
                onClick={handleRetry}
                startIcon={<Replay />}
              >
                Retry
              </Button>
            )}
            {!error && !isLoading && (
              <Button
                variant="contained"
                onClick={captureFace}
                disabled={isCapturing}
                sx={{ backgroundColor: "var(--primary-color)" }}
              >
                {isCapturing
                  ? "Scanning"
                  : mode === "login"
                  ? "Login with Face ID"
                  : "Add Face ID"}
              </Button>
            )}

            {isProcessing && (
              <div className="text-[var(--primary-color)] absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold">
                Processing. Please wait...
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FaceIDModal;
