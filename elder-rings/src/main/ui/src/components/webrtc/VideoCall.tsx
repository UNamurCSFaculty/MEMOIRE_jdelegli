import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import PrimeSpinnerDotted from "~icons/prime/spinner-dotted";
import Col from "@components/layout/Col";
import {
  IconMute,
  IconStopVideo,
  IconStartVideo,
  IconUnmute,
} from "@components/icons/favouriteIcons";
import { REMOTE_BUTTON_EVENT } from "@components/remote/RemoteButtonListener";
import { toggleMuteAudio, toggleVideo } from "@utils/webRtcHelper";
import VideoCallActionBar from "./VideoCallActionBar";
import Captions from "./Captions";
import CallEndedScreen from "./CallEndedScreen";
import { useAudioFilters } from "../../hooks/useAudioFilters";
import { useUser } from "../../hooks/useUser";
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
    userRejectedCall,
    endCall,
  } = useWebRtcCall(roomId, cameraOn, isCallee);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(cameraOn === false);
  const { handlePlay } = useAudioFilters(remoteVideoRef);
  const user = useUser();
  const isResident = user.userType === "RESIDENT";

  function endCallAndGoHome() {
    endCall();
    navigate("/");
  }

  // Residents drive the call with the TV remote: the on-screen action bar
  // is hidden for them, so the remote actions are handled here
  useEffect(() => {
    if (!isResident) return;

    const onRemoteButton = (e: Event) => {
      if (!isCallStarted) return;
      const action = (e as CustomEvent<string>).detail;
      if (action === "TOGGLE_CAMERA") {
        toggleVideo(peerConnection);
        setIsVideoHidden((prev) => !prev);
      } else if (action === "TOGGLE_MIC") {
        toggleMuteAudio(peerConnection);
        setIsAudioMuted((prev) => !prev);
      } else if (action === "END_CALL") {
        endCallAndGoHome();
      }
    };

    window.addEventListener(REMOTE_BUTTON_EVENT, onRemoteButton);
    return () => window.removeEventListener(REMOTE_BUTTON_EVENT, onRemoteButton);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResident, isCallStarted, peerConnection]);

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

      <div
        className={twMerge(
          "w-[20%] absolute bottom-4 right-4 border-2 border-gray-100 rounded-lg overflow-hidden",
          userConnected ? "" : "hidden",
        )}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted={true}
          className={twMerge("w-full", isVideoHidden ? "hidden" : "")}
        />
        {isVideoHidden && (
          <div className="aspect-video w-full bg-yellow-500 flex flex-col items-center justify-center gap-2 text-white px-6 py-3">
            <IconStopVideo className={"w-8 h-8"} />
            <p className={"font-semibold text-center text-xl"}>
              {t("Pages.CallRoom.CameraOffBadge")}
            </p>
            {isResident && (
              <p className={"text-center font-normal text-xl"}>
                <Trans i18nKey="Pages.CallRoom.CameraOffHint">
                  Appuyez sur le bouton <IconStartVideo className="inline align-text-bottom" /> de
                  la télécommande pour l'allumer
                </Trans>
              </p>
            )}
          </div>
        )}
      </div>

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

      {/* Muted microphone badge: the camera state is already shown by the
          local video placeholder, the microphone has no natural spot */}
      {userConnected && isAudioMuted && (
        <div
          className={
            "absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-yellow-500 text-white font-semibold rounded-full shadow-lg px-6 py-3 text-xl"
          }
        >
          <IconMute className={"w-8 h-8"} />
          <p className="flex flex-col">
            {t("Pages.CallRoom.MicOffBadge")}
            {isResident && (
              <span className={"font-normal text-xl"}>
                <Trans i18nKey="Pages.CallRoom.MicOffHint">
                  Appuyez sur le bouton <IconUnmute className="inline align-text-bottom" /> de la
                  télécommande pour l'allumer
                </Trans>
              </span>
            )}
          </p>
        </div>
      )}

      {/* text Captions - Positioned just above the action bar */}
      <Captions
        peerConnection={peerConnection}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
        emitCaptions={!isAudioMuted}
      />

      {/* Action Bar - desktop browsers only: residents use the TV remote */}
      {!isResident && (
        <VideoCallActionBar
          disabled={!isCallStarted}
          peerConnection={peerConnection}
          localVideoRef={localVideoRef}
          endCall={endCallAndGoHome}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          isVideoHidden={isVideoHidden}
          setIsVideoHidden={setIsVideoHidden}
        />
      )}
    </div>
  );
}
