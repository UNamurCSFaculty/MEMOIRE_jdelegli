import VideoCall from "@components/webrtc/VideoCall";
import { useLocation, useParams } from "react-router-dom";

export default function CallRoomPage() {
  const location = useLocation();
  const state = location.state as { cameraOn?: boolean } | null;
  const { roomId } = useParams();

  if (!roomId) return <p>error</p>;
  // keyed on the room: accepting an invitation while already in a call must
  // build a new call rather than reuse the peer connections of the previous one
  else return <VideoCall key={roomId} roomId={roomId} cameraOn={state?.cameraOn} />;
}
