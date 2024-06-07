import dynamic from "next/dynamic";

const FaceRecognition = dynamic(() => import("./components/FaceRecognition"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <h1>Face Recognition App</h1>
      <FaceRecognition />
    </div>
  );
}
