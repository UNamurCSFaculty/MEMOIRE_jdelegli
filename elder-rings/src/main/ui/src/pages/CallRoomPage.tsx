import VideoCall from "@components/webrtc/VideoCall";
import { useLocation, useParams } from "react-router-dom";

export default function CallRoomPage() {
  const location = useLocation();
  const isCallee = (location.state as { isCallee?: boolean } | null)?.isCallee;
  const { roomId } = useParams();

  if (!roomId) return <p>error</p>;
  else return <VideoCall roomId={roomId} isCallee={isCallee} />;
}
