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
import { Button, Tooltip } from "@heroui/react";
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
  isAudioMuted: boolean;
  setIsAudioMuted: (b: boolean) => void;
  isVideoHidden: boolean;
  setIsVideoHidden: (b: boolean) => void;
}

export default function VideoCallActionBar({
  disabled,
  endCall,
  localVideoRef,
  peerConnection,
  className,
  isAudioMuted,
  setIsAudioMuted,
  isVideoHidden,
  setIsVideoHidden,
}: Readonly<VideoCallActionBarProps>) {
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  return (
    <div className={className ?? ""}>
      <Row className="gap-4 mx-auto">
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              variant="danger"
              size="lg"
              onPress={endCall}
              aria-label={t("Pages.CallRoom.EndCall")}
            >
              <IconEndCall />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{t("Pages.CallRoom.EndCall")}</Tooltip.Content>
        </Tooltip>

        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              size="lg"
              onPress={() => {
                if (isScreenSharing) {
                  stopScreenShare(peerConnection, localVideoRef);
                } else {
                  startScreenShare(peerConnection, localVideoRef);
                }
                setIsScreenSharing(!isScreenSharing);
              }}
              isDisabled={disabled}
              aria-label={
                isScreenSharing
                  ? t("Pages.CallRoom.StopScreenShare")
                  : t("Pages.CallRoom.ShareScreen")
              }
            >
              {isScreenSharing ? <IconScreenShareStop /> : <IconScreenShare />}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {isScreenSharing
              ? t("Pages.CallRoom.StopScreenShare")
              : t("Pages.CallRoom.ShareScreen")}
          </Tooltip.Content>
        </Tooltip>

        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              size="lg"
              onPress={() => {
                toggleMuteAudio(peerConnection);
                setIsAudioMuted(!isAudioMuted);
              }}
              isDisabled={disabled}
              aria-label={isAudioMuted ? t("Pages.CallRoom.Unmute") : t("Pages.CallRoom.Mute")}
            >
              {isAudioMuted ? <IconUnmute /> : <IconMute />}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {isAudioMuted ? t("Pages.CallRoom.Unmute") : t("Pages.CallRoom.Mute")}
          </Tooltip.Content>
        </Tooltip>

        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              size="lg"
              onPress={() => {
                toggleVideo(peerConnection);
                setIsVideoHidden(!isVideoHidden);
              }}
              isDisabled={disabled}
              aria-label={
                isVideoHidden ? t("Pages.CallRoom.DisplayVideo") : t("Pages.CallRoom.HideVideo")
              }
            >
              {isVideoHidden ? <IconStartVideo /> : <IconStopVideo />}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {isVideoHidden ? t("Pages.CallRoom.DisplayVideo") : t("Pages.CallRoom.HideVideo")}
          </Tooltip.Content>
        </Tooltip>
      </Row>
    </div>
  );
}
