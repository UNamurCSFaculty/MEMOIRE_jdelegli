import {
  IconEndCall,
  IconScreenShareStop,
  IconScreenShare,
  IconUnmute,
  IconMute,
  IconStartVideo,
  IconStopVideo,
} from "@components/icons/favouriteIcons";
import Row from "@components/layout/Row";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import {
  stopScreenShare,
  startScreenShare,
  toggleMuteAudio,
  toggleVideo,
} from "@utils/webRtcHelper";
import { t } from "i18next";
import { RefObject, useState } from "react";

interface VideoCallActionBarProps {
  disabled: boolean;
  peerConnection: RefObject<RTCPeerConnection>;
  localVideoRef: RefObject<HTMLVideoElement>;
  endCall: () => void;
  className?: string;
}

export default function VideoCallActionBar({
  disabled,
  endCall,
  localVideoRef,
  peerConnection,
  className,
}: Readonly<VideoCallActionBarProps>) {
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);

  return (
    <div className={className ?? ""}>
      <Row className="gap-4 mx-auto">
        <Tooltip content={t("Pages.CallRoom.EndCall")}>
          <Button isIconOnly size="lg" color="danger" onPress={endCall} disabled={disabled}>
            <IconEndCall />
          </Button>
        </Tooltip>
        {isScreenSharing ? (
          <Tooltip content={t("Pages.CallRoom.StopScreenShare")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                stopScreenShare(peerConnection, localVideoRef);
                setIsScreenSharing(false);
              }}
              disabled={disabled}
            >
              <IconScreenShareStop />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={t("Pages.CallRoom.ShareScreen")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                startScreenShare(peerConnection, localVideoRef);
                setIsScreenSharing(true);
              }}
              disabled={disabled}
            >
              <IconScreenShare />
            </Button>
          </Tooltip>
        )}
        {isAudioMuted ? (
          <Tooltip content={t("Pages.CallRoom.Unmute")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                toggleMuteAudio(peerConnection);
                setIsAudioMuted(false);
              }}
              disabled={disabled}
            >
              <IconUnmute />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={t("Pages.CallRoom.Mute")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                toggleMuteAudio(peerConnection);
                setIsAudioMuted(true);
              }}
              disabled={disabled}
            >
              <IconMute />
            </Button>
          </Tooltip>
        )}
        {isVideoHidden ? (
          <Tooltip content={t("Pages.CallRoom.DisplayVideo")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                toggleVideo(peerConnection);
                setIsVideoHidden(false);
              }}
              disabled={disabled}
            >
              <IconStartVideo />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={t("Pages.CallRoom.HideVideo")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                toggleVideo(peerConnection);
                setIsVideoHidden(true);
              }}
              disabled={disabled}
            >
              <IconStopVideo />
            </Button>
          </Tooltip>
        )}
      </Row>
    </div>
  );
}
