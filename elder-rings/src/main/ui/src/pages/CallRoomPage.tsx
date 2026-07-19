import VideoCall from "@components/webrtc/VideoCall";
import { useLocation, useParams } from "react-router-dom";

export default function CallRoomPage() {
  const location = useLocation();
  const state = location.state as { cameraOn?: boolean; isCallee?: boolean } | null;
  const { roomId } = useParams();

  if (!roomId) return <p>error</p>;
  else return <VideoCall roomId={roomId} cameraOn={state?.cameraOn} isCallee={state?.isCallee} />;
}
