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
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

interface VideoCallActionBarProps {
  disabled: boolean;
  peerConnection: RefObject<RTCPeerConnection>;
  localVideoRef: RefObject<HTMLVideoElement>;
  endCall: () => void;
  className?: string;
  isAudioMuted: boolean;
  setIsAudioMuted: (b: boolean) => void;
}

export default function VideoCallActionBar({
  disabled,
  endCall,
  localVideoRef,
  peerConnection,
  className,
  isAudioMuted,
  setIsAudioMuted,
}: Readonly<VideoCallActionBarProps>) {
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    console.log("E", e);
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
        <Tooltip content={t("Pages.CallRoom.EndCall")}>
          <Button
            isIconOnly
            size="lg"
            color="danger"
            onPress={endCall}
            onKeyDown={handleKeyNavigation}
            disabled={disabled}
            ref={registerButtonRef(0)}
          >
            <IconEndCall />
          </Button>
        </Tooltip>

        <Tooltip
          content={
            isScreenSharing ? t("Pages.CallRoom.StopScreenShare") : t("Pages.CallRoom.ShareScreen")
          }
        >
          <Button
            isIconOnly
            size="lg"
            color="default"
            onPress={() => {
              if (isScreenSharing) {
                stopScreenShare(peerConnection, localVideoRef);
              } else {
                startScreenShare(peerConnection, localVideoRef);
              }
              setIsScreenSharing(!isScreenSharing);
            }}
            onKeyDown={handleKeyNavigation}
            disabled={disabled}
            ref={registerButtonRef(1)}
          >
            {isScreenSharing ? <IconScreenShareStop /> : <IconScreenShare />}
          </Button>
        </Tooltip>

        <Tooltip content={isAudioMuted ? t("Pages.CallRoom.Unmute") : t("Pages.CallRoom.Mute")}>
          <Button
            isIconOnly
            size="lg"
            color="default"
            onPress={() => {
              toggleMuteAudio(peerConnection);
              setIsAudioMuted(!isAudioMuted);
            }}
            onKeyDown={handleKeyNavigation}
            disabled={disabled}
            ref={registerButtonRef(2)}
          >
            {isAudioMuted ? <IconUnmute /> : <IconMute />}
          </Button>
        </Tooltip>

        <Tooltip
          content={isVideoHidden ? t("Pages.CallRoom.DisplayVideo") : t("Pages.CallRoom.HideVideo")}
        >
          <Button
            isIconOnly
            size="lg"
            color="default"
            onPress={() => {
              toggleVideo(peerConnection);
              setIsVideoHidden(!isVideoHidden);
            }}
            onKeyDown={handleKeyNavigation}
            disabled={disabled}
            ref={registerButtonRef(3)}
          >
            {isVideoHidden ? <IconStartVideo /> : <IconStopVideo />}
          </Button>
        </Tooltip>
      </Row>
    </div>
  );
}
