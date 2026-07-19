import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import PrimeSpinnerDotted from "~icons/prime/spinner-dotted";
import Col from "@components/layout/Col";
import VideoCallActionBar from "./VideoCallActionBar";
import Captions from "./Captions";
import CallEndedScreen from "./CallEndedScreen";
import { useAudioFilters } from "../../hooks/useAudioFilters";
import { useWebRtcCall } from "../../hooks/useWebRtcCall";

export interface VideoCallProps {
  roomId: string;
  cameraOn?: boolean | null;
  isCallee?: boolean;
}

export default function VideoCall({ roomId, cameraOn, isCallee }: Readonly<VideoCallProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    localVideoRef,
    remoteVideoRef,
    peerConnection,
    isCallStarted,
    userConnected,
    userLeft,
    userRejectedCall,
    endCall,
  } = useWebRtcCall(roomId, cameraOn, isCallee);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const { handlePlay } = useAudioFilters(remoteVideoRef);

  function endCallAndGoHome() {
    endCall();
    navigate("/");
  }

  if (userLeft) {
    return <CallEndedScreen message={t("Pages.CallRoom.UserLeft")} />;
  }

  if (userRejectedCall) {
    return <CallEndedScreen message={t("Pages.CallRoom.UserRejectedCall")} />;
  }

  return (
    <div className="w-screen h-screen bg-black">
      {/* Remote Video - Fullscreen */}
      <video
        ref={remoteVideoRef}
        onPlay={handlePlay}
        autoPlay
        muted={false}
        className={twMerge("h-full w-full", userConnected ? "" : "hidden")}
      />

      {/* Local Video - Bottom Right Overlay */}
      <video
        ref={localVideoRef}
        autoPlay
        muted={true}
        className={twMerge(
          "w-[20%] absolute bottom-4 right-4 border-2 border-gray-100 rounded-lg",
          userConnected ? "" : "hidden",
        )}
      />

      {/* Waiting State - Hidden when user is connected */}
      <Col
        className={twMerge(
          "h-full w-full bg-gray-200 rounded-xl flex items-center justify-center",
          userConnected ? "hidden" : "",
        )}
      >
        <PrimeSpinnerDotted className="animate-spin h-12 w-12 text-gray-600/80 mx-auto" />
        <p className="text-center font-semibold text-xl text-gray-700">
          {t("Pages.CallRoom.WaitingUserToJoin")}
        </p>
      </Col>

      {/* text Captions - Positioned just above the action bar */}
      <Captions
        peerConnection={peerConnection}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
        emitCaptions={!isAudioMuted}
      />

      {/* Action Bar - Positioned at the bottom of remote video */}
      <VideoCallActionBar
        disabled={!isCallStarted}
        peerConnection={peerConnection}
        localVideoRef={localVideoRef}
        endCall={endCallAndGoHome}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        initialVideoHidden={cameraOn === false}
      />
    </div>
  );
}
