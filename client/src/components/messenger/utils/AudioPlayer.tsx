import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const AudioPlayer = ({
  src,
  onLoadedData,
}: {
  src: string;
  onLoadedData: () => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0
    );
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
    onLoadedData();
  };

  const changeProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    setVolume(newMutedState ? 0 : audioRef.current.volume);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg shadow-md max-w-[100%] group">
      <button
        onClick={togglePlay}
        className="p-3 bg-[#00ff00] text-gray-900 rounded-full hover:bg-[#00dd00] transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-[#00ff00] text-sm font-mono">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={changeProgress}
          className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer accent-[#00ff00]"
        />
        <span className="text-[#00ff00] text-sm font-mono">
          {formatTime(duration)}
        </span>
      </div>

      <div
        className="relative flex items-center"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        {/* Mute düyməsi */}
        <button
          onClick={toggleMute}
          className="p-2 text-[#00ff00] hover:bg-gray-700 rounded-lg"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Volume slider hover olduqda göstərilir */}
        {showVolumeSlider && (
          <div className="absolute bottom-[87px] mb-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={changeVolume}
              className="h-24 bg-gray-600 rounded-lg accent-[#00ff00] cursor-pointer origin-bottom transform -rotate-90"
            />
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={onLoadedData}
      />
    </div>
  );
};

export default AudioPlayer;
