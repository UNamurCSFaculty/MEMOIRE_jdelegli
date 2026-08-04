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
import ParticipantTile from "./ParticipantTile";
import { useUser } from "../../hooks/useUser";
import { useWebRtcCall } from "../../hooks/useWebRtcCall";

export interface VideoCallProps {
  roomId: string;
  cameraOn?: boolean | null;
}

/**
 * The remote participants share the screen as a grid: one tile each, so the
 * layout holds from a one to one call up to a small group.
 */
function gridClassFor(participantCount: number): string {
  if (participantCount <= 1) {
    return "grid-cols-1";
  }
  if (participantCount === 2) {
    return "grid-cols-1 sm:grid-cols-2";
  }
  return "grid-cols-2";
}

export default function VideoCall({ roomId, cameraOn }: Readonly<VideoCallProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    localVideoRef,
    localStreamRef,
    participants,
    captions,
    isCallStarted,
    isRoomJoined,
    isScreenSharing,
    userRejectedCall,
    mediaError,
    sendCaption,
    startScreenShare,
    stopScreenShare,
    endCall,
  } = useWebRtcCall(roomId, cameraOn);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(cameraOn === false);
  const user = useUser();
  const isResident = user.userType === "RESIDENT";
  const someoneConnected = participants.length > 0;

  function endCallAndGoHome() {
    endCall();
    navigate("/");
  }

  // Residents drive the call with the TV remote: the on-screen action bar
  // is hidden for them, so the remote actions are handled here
  useEffect(() => {
    if (!isResident) return;

    const onRemoteButton = (e: Event) => {
      const action = (e as CustomEvent<string>).detail;
      // hanging up must always work, even when the media never started
      if (action === "END_CALL") {
        endCallAndGoHome();
        return;
      }
      if (!isCallStarted) return;
      if (action === "TOGGLE_CAMERA") {
        setIsVideoHidden(toggleVideo(localStreamRef.current));
      } else if (action === "TOGGLE_MIC") {
        setIsAudioMuted(toggleMuteAudio(localStreamRef.current));
      }
    };

    window.addEventListener(REMOTE_BUTTON_EVENT, onRemoteButton);
    return () => window.removeEventListener(REMOTE_BUTTON_EVENT, onRemoteButton);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResident, isCallStarted]);

  if (userRejectedCall) {
    return <CallEndedScreen message={t("Pages.CallRoom.UserRejectedCall")} />;
  }

  return (
    <div className="w-screen h-screen bg-black">
      {/* Remote participants */}
      {someoneConnected && (
        <div className={twMerge("grid gap-2 h-full w-full", gridClassFor(participants.length))}>
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.userId}
              userId={participant.userId}
              stream={participant.stream}
              caption={captions[participant.userId]}
            />
          ))}
        </div>
      )}

      <div
        className={twMerge(
          "w-[20%] absolute bottom-4 right-4 border-2 border-gray-100 rounded-lg overflow-hidden",
          someoneConnected ? "" : "hidden",
        )}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted={true}
          // while the screen is shared it is the screen that goes out, so the
          // camera badge would claim the opposite of what the peers receive
          className={twMerge("w-full", isVideoHidden && !isScreenSharing ? "hidden" : "")}
        />
        {isVideoHidden && !isScreenSharing && (
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

      {/* Waiting State - Hidden as soon as someone is in the call */}
      <Col
        className={twMerge(
          "h-full w-full bg-gray-200 rounded-xl flex items-center justify-center",
          someoneConnected ? "hidden" : "",
        )}
      >
        <PrimeSpinnerDotted className="animate-spin h-12 w-12 text-gray-600/80 mx-auto" />
        <p className="text-center font-semibold text-xl text-gray-700">
          {t("Pages.CallRoom.WaitingUserToJoin")}
        </p>
      </Col>

      {/* Shown whatever the state of the call: a participant tile exists as
          soon as someone is expected, so the waiting column is not a reliable
          place to explain that the camera was refused */}
      {mediaError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-semibold rounded-full shadow-lg px-6 py-3 text-xl">
          {t("Pages.CallRoom.MediaError")}
        </div>
      )}

      {/* Muted microphone badge: the camera state is already shown by the
          local video placeholder, the microphone has no natural spot */}
      {someoneConnected && isAudioMuted && (
        <div
          className={twMerge(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-yellow-500 text-white font-semibold rounded-full shadow-lg px-6 py-3 text-xl",
            mediaError ? "top-24" : "top-6",
          )}
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

      {/* Speech recognition: each caption is displayed on its author's tile */}
      <Captions sendCaption={sendCaption} emitCaptions={!isAudioMuted} />

      {/* Action Bar - desktop browsers only: residents use the TV remote */}
      {!isResident && (
        <VideoCallActionBar
          disabled={!isCallStarted}
          isRoomJoined={isRoomJoined}
          localStreamRef={localStreamRef}
          endCall={endCallAndGoHome}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          isVideoHidden={isVideoHidden}
          setIsVideoHidden={setIsVideoHidden}
          isScreenSharing={isScreenSharing}
          startScreenShare={startScreenShare}
          stopScreenShare={stopScreenShare}
          roomId={roomId}
        />
      )}
    </div>
  );
}
