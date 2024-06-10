"use client";

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import Camera from "./Camera";

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [emotionMessage, setEmotionMessage] = useState("");

  const [emotionCounts, setEmotionCounts] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0,
  });

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
              setEmotionMessage("幸せ");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                happy: prevCounts.happy + 1,
              }));
              break;
            case "sad":
              setEmotionMessage("悲しい");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                sad: prevCounts.sad + 1,
              }));
              break;
            case "angry":
              setEmotionMessage("怒り");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                angry: prevCounts.angry + 1,
              }));
              break;
            case "fearful":
              setEmotionMessage("恐怖");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                fearful: prevCounts.fearful + 1,
              }));
              break;
            case "disgusted":
              setEmotionMessage("むかつく");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                disgusted: prevCounts.disgusted + 1,
              }));
              break;
            case "surprised":
              setEmotionMessage("驚いた");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                surprised: prevCounts.surprised + 1,
              }));
              break;
            case "neutral":
              setEmotionMessage("ニュートラル");
              setEmotionCounts((prevCounts) => ({
                ...prevCounts,
                neutral: prevCounts.neutral + 1,
              }));
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
        <h1 className="text-xl font-bold">顔認識ダッシュボード</h1>
      </header>
      <main className="flex flex-1 flex-col lg:flex-row p-4">
        <div className="flex flex-col w-full lg:w-2/3 p-4 bg-white shadow-md rounded-lg">
          <div className="relative">
            <Camera ref={videoRef} onPlay={handleVideoPlay} />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
        <aside className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded-lg mt-4 lg:mt-0 lg:ml-4">
          <div className="p-4 bg-gray-200 rounded-lg mb-4">
            <h2 className="text-xl font-semibold">感情検出</h2>
            <p className="text-lg text-yellow-600">{emotionMessage}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-black">感情統計</h3>
            <p className="text-black">幸せ: {emotionCounts.happy}</p>
            <p className="text-black">悲しい: {emotionCounts.sad}</p>
            <p className="text-black">怒り: {emotionCounts.angry}</p>
            <p className="text-black">恐怖: {emotionCounts.fearful}</p>
            <p className="text-black">むかつく: {emotionCounts.disgusted}</p>
            <p className="text-black">驚いた: {emotionCounts.surprised}</p>
            <p className="text-black">ニュートラル: {emotionCounts.neutral}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-black">その他の指標</h3>
            <p className="text-black">指標1：価値</p>
            <p className="text-black">指標2：価値</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FaceRecognition;
