import VideoCall from "@components/webrtc/VideoCall";
import { useParams } from "react-router-dom";

export default function CallRoomPage() {
  const { roomId } = useParams();
  if (!roomId) return <p>error</p>;
  else return <VideoCall roomId={roomId} />;
}
