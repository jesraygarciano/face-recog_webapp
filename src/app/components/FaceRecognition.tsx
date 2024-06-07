"use client";

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import Camera from "./Camera";

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [emotionMessage, setEmotionMessage] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };

    loadModels();
  }, []);

  const handleVideoPlay = async () => {
    if (!modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const { x, y, width, height } = detection.detection.box;
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, [detection]);
          faceapi.draw.drawFaceLandmarks(canvas, [detection]);

          const expressions = detection.expressions;
          const maxValue = Math.max(...Object.values(expressions));
          const emotion = Object.keys(expressions).find(
            (key) =>
              expressions[key as keyof faceapi.FaceExpressions] === maxValue
          );

          switch (emotion) {
            case "happy":
              setEmotionMessage("HAPPY");
              break;
            case "sad":
              setEmotionMessage("SAD");
              break;
            case "angry":
              setEmotionMessage("ANYRY");
              break;
            case "fearful":
              setEmotionMessage("FEARFUL");
              break;
            case "disgusted":
              setEmotionMessage("DISGUSTED?");
              break;
            case "surprised":
              setEmotionMessage("SURPRISED");
              break;
            case "neutral":
              setEmotionMessage("NEUTRAL");
              break;
            default:
              setEmotionMessage("");
              break;
          }
        });
      }, 100);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadedmetadata", handleVideoPlay);
      return () => {
        video.removeEventListener("loadedmetadata", handleVideoPlay);
      };
    }
  }, [modelsLoaded]);

  return (
    <div style={{ position: "relative" }}>
      <Camera ref={videoRef} onPlay={handleVideoPlay} />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          backgroundColor: "black",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {emotionMessage}
      </div>
    </div>
  );
};

export default FaceRecognition;
