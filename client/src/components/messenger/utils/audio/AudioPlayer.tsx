import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const AudioPlayer = ({
  src,
  onLoadedData,
}: {
  src: string;
  onLoadedData: () => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
    if (!audioRef.current || !audioRef.current.duration) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100
    );
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const checkDuration = () => {
      if (audioRef.current && isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
        onLoadedData();
      } else {
        setTimeout(checkDuration, 1000);
      }
    };
    checkDuration();
  };

  // Audio bitəndə çağırılacaq funksiyanı əlavə edirik
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
  };

  const changeProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * audioRef.current.duration;
    if (!isFinite(newTime)) return;
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  return (
    <div className="flex items-center gap-4 px-3 rounded-lg w-full">
      <button
        onClick={togglePlay}
        className="p-2 md:p-3 bg-[#00ff00] text-gray-900 rounded-full hover:bg-[#00dd00] transition-colors"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <div className="flex flex-col flex-1">
        <div>
          <input
            type="range"
            min="0"
            max="100"
            value={isFinite(progress) ? progress : 0}
            onChange={changeProgress}
            className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer accent-[#00ff00]"
          />
        </div>
        <div className="flex justify-between mt-1 text-[#00ff00] text-base font-mono">
          <span className="voice-current-time">{formatTime(currentTime)}</span>
          <span className="voice-duration-time">{formatTime(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        onError={(e) => console.error("Audio error:", e)}
      />
    </div>
  );
};

export default AudioPlayer;
