import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

interface CameraProps {
  onPlay: () => void;
}

const Camera = forwardRef<HTMLVideoElement, CameraProps>(({ onPlay }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => videoRef.current!);

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
});

Camera.displayName = "Camera";

export default Camera;
