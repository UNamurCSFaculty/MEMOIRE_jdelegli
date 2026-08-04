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
import { toggleMuteAudio, toggleVideo } from "@utils/webRtcHelper";
import { t } from "i18next";
import { MutableRefObject } from "react";

interface VideoCallActionBarProps {
  disabled: boolean;
  localStreamRef: MutableRefObject<MediaStream | null>;
  endCall: () => void;
  className?: string;
  isAudioMuted: boolean;
  setIsAudioMuted: (b: boolean) => void;
  isVideoHidden: boolean;
  setIsVideoHidden: (b: boolean) => void;
  isScreenSharing: boolean;
  startScreenShare: () => void;
  stopScreenShare: () => void;
}

export default function VideoCallActionBar({
  disabled,
  endCall,
  localStreamRef,
  className,
  isAudioMuted,
  setIsAudioMuted,
  isVideoHidden,
  setIsVideoHidden,
  isScreenSharing,
  startScreenShare,
  stopScreenShare,
}: Readonly<VideoCallActionBarProps>) {
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
              onPress={() => (isScreenSharing ? stopScreenShare() : startScreenShare())}
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
              onPress={() => setIsAudioMuted(toggleMuteAudio(localStreamRef.current))}
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
              onPress={() => setIsVideoHidden(toggleVideo(localStreamRef.current))}
              // the camera toggle would not change what peers receive while the
              // screen is shared
              isDisabled={disabled || isScreenSharing}
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
