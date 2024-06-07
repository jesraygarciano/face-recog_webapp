import React, { useRef, useEffect } from "react";

interface CameraProps {
  onPlay: () => void;
}

const Camera: React.FC<CameraProps> = ({ onPlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    startVideo();
  }, []);

  return (
    <video
      ref={videoRef}
      onPlay={onPlay}
      autoPlay
      muted
      style={{ width: "100%", height: "auto" }}
    />
  );
};

export default Camera;
