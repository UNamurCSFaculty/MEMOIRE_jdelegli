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
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

interface VideoCallActionBarProps {
  disabled: boolean;
  peerConnection: RefObject<RTCPeerConnection>;
  localVideoRef: RefObject<HTMLVideoElement>;
  endCall: () => void;
  className?: string;
  isAudioMuted: boolean;
  setIsAudioMuted: (b: boolean) => void;
  initialVideoHidden?: boolean;
}

export default function VideoCallActionBar({
  disabled,
  endCall,
  localVideoRef,
  peerConnection,
  className,
  isAudioMuted,
  setIsAudioMuted,
  initialVideoHidden,
}: Readonly<VideoCallActionBarProps>) {
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isVideoHidden, setIsVideoHidden] = useState(initialVideoHidden ?? false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.defaultPrevented) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % buttonRefs.current.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === 0 ? buttonRefs.current.length - 1 : prev - 1));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasFocus = buttonRefs.current.some((ref) => ref === document.activeElement);
      if (!hasFocus && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        setFocusedIndex(0);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const nextFocused = e.relatedTarget as HTMLElement | null;

      const focusIsStillInside = buttonRefs.current.some((ref) => ref?.contains(nextFocused));
      if (!focusIsStillInside) {
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusout", handleFocusOut, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusout", handleFocusOut, true);
    };
  }, []);

  useEffect(() => {
    if (focusedIndex >= 0) {
      buttonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const registerButtonRef = (index: number) => (el: HTMLButtonElement | null) => {
    buttonRefs.current[index] = el;
  };

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
              onKeyDown={handleKeyNavigation}
              ref={registerButtonRef(0)}
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
              onKeyDown={handleKeyNavigation}
              isDisabled={disabled}
              ref={registerButtonRef(1)}
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
              onKeyDown={handleKeyNavigation}
              isDisabled={disabled}
              ref={registerButtonRef(2)}
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
              onKeyDown={handleKeyNavigation}
              isDisabled={disabled}
              ref={registerButtonRef(3)}
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
