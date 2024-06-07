import dynamic from "next/dynamic";

const FaceRecognition = dynamic(() => import("./components/FaceRecognition"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <FaceRecognition />
    </div>
  );
}
