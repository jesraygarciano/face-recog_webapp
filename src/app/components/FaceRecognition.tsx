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
              setEmotionMessage("ANGRY");
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
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-1xl font-bold">Face Recognition Dashboard</h1>
      </header>
      <main className="flex flex-1 p-4">
        <div className="flex flex-col w-full lg:w-2/3 p-4 bg-white shadow-md rounded-lg">
          <div className="relative">
            <Camera ref={videoRef} onPlay={handleVideoPlay} />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
        <aside className="hidden lg:block lg:w-1/3 p-4 bg-white shadow-md rounded-lg ml-4">
          <div className="bg-gray-200 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold">Emotion Detection</h3>
            <p className="text-lg text-yellow-600">{emotionMessage}</p>
          </div>
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="bg-gray-200 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold">Emotion Statistics</h3>
            <p>Happy: 10</p>
            <p>Sad: 5</p>
            <p>Angry: 2</p>
            <p>Surprised: 3</p>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Other Metrics</h3>
            <p>Metric 1: Value</p>
            <p>Metric 2: Value</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FaceRecognition;
