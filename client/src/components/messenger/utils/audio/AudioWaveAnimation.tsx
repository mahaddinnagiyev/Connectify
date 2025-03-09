import React, { useRef, useState, useEffect } from "react";
import { LiveAudioVisualizer } from "react-audio-visualize";

interface AudioWaveAnimationProps {
  mediaRecorder: MediaRecorder;
}

const AudioWaveAnimation: React.FC<AudioWaveAnimationProps> = ({
  mediaRecorder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {mediaRecorder && (
        <LiveAudioVisualizer
          mediaRecorder={mediaRecorder}
          barColor={"#00ff00"}
          height={47}
          width={containerWidth}
        />
      )}
    </div>
  );
};

export default AudioWaveAnimation;
