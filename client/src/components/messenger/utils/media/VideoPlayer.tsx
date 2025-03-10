import { useState, useRef, useEffect } from "react";
import { IconButton, Slider, Box, styled, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MessagesDTO } from "../../../../services/socket/dto/messages-dto";

const VideoContainer = styled(Box)({
  position: "relative",
  display: "inline-block",
  maxWidth: "90vw",
  maxHeight: "80vh",
  "&:hover .controls": {
    opacity: 1,
  },
  "&:hover .video-progress-slider": {
    opacity: 1,
  },
});

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  transition: "opacity 0.3s",
  opacity: 0,
}));

const ProgressSliderOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 40,
  left: 0,
  right: 0,
  padding: theme.spacing(0, 2),
  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
  transition: "opacity 0.3s",
  opacity: 0,
}));

interface VideoPlayerProps {
  message: MessagesDTO;
  handleDownload: () => void;
  onClose: () => void;
}

const VideoPlayer = ({
  message,
  handleDownload,
  onClose,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    setIsPiPSupported(document.pictureInPictureEnabled);

    const savedVolume = localStorage.getItem("videoVolume");
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      if (videoElement) {
        videoElement.volume = vol;
      }
    }

    if (videoElement) {
      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
      };
      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);

      videoElement.play();
      setIsPlaying(true);

      return () => {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    const savedVolume = localStorage.getItem("videoVolume");
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      setIsMuted(vol === 0);
      if (vol > 0) setPreviousVolume(vol);
    }
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    localStorage.setItem("videoVolume", newVolume.toString());

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      if (videoRef.current) videoRef.current.volume = previousVolume;
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      if (videoRef.current) videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressChange = (_: Event, value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <VideoContainer onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          src={message.content}
          style={{
            width: "100%",
            maxWidth: "90vw",
            maxHeight: "80vh",
            border: "3px solid #00ff00",
            borderRadius: "8px",
            backgroundColor: "#000",
            display: "block",
          }}
          onClick={togglePlayPause}
        />

        <ProgressSliderOverlay className="video-progress-slider">
          <Slider
            value={currentTime}
            min={0}
            max={duration}
            step={0.1}
            onChange={handleProgressChange}
            sx={{
              width: "100%",
              color: "#00ff00",
              "& .MuiSlider-thumb": {
                width: 10,
                height: 10,
                borderRadius: "50%",
              },
            }}
          />
        </ProgressSliderOverlay>

        <ControlsOverlay className="controls">
          <IconButton onClick={togglePlayPause} sx={{ color: "#00ff00" }}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Typography
            variant="body2"
            sx={{
              color: "#00ff00",
              ml: 1,
              fontSize: {
                xs: "0.75rem",
                sm: "0.875rem",
              },
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            sx={{
              display: "flex",
              alignItems: "center",
              ml: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <IconButton
              onClick={toggleMute}
              sx={{ color: "#00ff00" }}
              onMouseEnter={() => setShowVolumeSlider(true)}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Box
              sx={{
                width: showVolumeSlider ? 100 : 0,
                opacity: showVolumeSlider ? 1 : 0,
                transition: "all 0.3s ease",
                ml: 1,
              }}
            >
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{
                  height: 4,
                  color: "#00ff00",
                  "& .MuiSlider-thumb": {
                    width: 12,
                    height: 12,
                    display: isMuted ? "none" : "block",
                    borderRadius: "50%",
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: "0 0 0 8px rgba(0, 255, 0, 0.16)",
                    },
                  },
                  transition: "opacity 0.3s ease 0.1s",
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>

          {isPiPSupported && !isMobile && (
            <IconButton
              onClick={togglePiP}
              sx={{ color: "#00ff00", ml: "auto", pr: "4px" }}
            >
              <PictureInPictureAltIcon />
            </IconButton>
          )}

          {!isMobile && (
            <IconButton
              onClick={handleDownload}
              sx={{ color: "#00ff00", pr: "0px" }}
            >
              <DownloadIcon />
            </IconButton>
          )}

          {isMobile && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: "#00ff00", ml: "auto" }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                  sx: {
                    backgroundColor: "rgba(0,0,0,0.9)",
                    color: "#00ff00",
                  },
                }}
              >
                {isPiPSupported && (
                  <MenuItem
                    onClick={() => {
                      togglePiP();
                      handleMenuClose();
                    }}
                  >
                    <PictureInPictureAltIcon sx={{ mr: 1.5 }} />
                    Picture-in-Picture
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    handleDownload();
                    handleMenuClose();
                  }}
                >
                  <DownloadIcon sx={{ mr: 1.5 }} />
                  Download
                </MenuItem>
              </Menu>
            </>
          )}

          <IconButton onClick={onClose} sx={{ color: "#00ff00" }}>
            <FullscreenExitIcon />
          </IconButton>
        </ControlsOverlay>
      </VideoContainer>
    </Box>
  );
};

export default VideoPlayer;
