"use client";

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import Camera from "./Camera";

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
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
          .withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
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
    <div>
      <div className="main">
        <Camera ref={videoRef} onPlay={handleVideoPlay} />
        <canvas ref={canvasRef} style={{ position: "absolute" }} />
      </div>
    </div>
  );
};

export default FaceRecognition;
