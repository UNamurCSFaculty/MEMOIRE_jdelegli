//Note : this component will be split in the future

import {
  answerCall,
  initiateCall,
  onIceCandidateHandler,
  onTrackHandler,
  proccessWebRTCMessage,
  startScreenShare,
  stopScreenShare,
  terminateCall,
  toggleMuteAudio,
} from "@utils/webRtcHelper";
import { buildWsUrl } from "@utils/webSocketHelper";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useWebSocket from "react-use-websocket";
import { webrtcWebSocketEventMessage } from "../../types/rtcWebSocketEventMessage";
import { twMerge } from "tailwind-merge";
import PrimeSpinnerDotted from "~icons/prime/spinner-dotted";
import Row from "@components/layout/Row";
import Col from "@components/layout/Col";
import {
  IconEndCall,
  IconMute,
  IconScreenShare,
  IconScreenShareStop,
  IconStartVideo,
  IconStopVideo,
  IconUnmute,
} from "@components/icons/favouriteIcons";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { useNavigate } from "react-router-dom";

export interface VideoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: Readonly<VideoCallProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getWebSocket, lastJsonMessage, sendJsonMessage } = useWebSocket(
    buildWsUrl("call-room", roomId)
  );
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [userConnected, setUserConnected] = useState<boolean>(false);
  const [userLeft, setUserLeft] = useState<boolean>(false);

  useEffect(() => {
    const ws = getWebSocket();

    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection();
      peerConnection.current.onicecandidate = (evt) => onIceCandidateHandler(evt, sendJsonMessage);
      peerConnection.current.ontrack = (evt) => onTrackHandler(evt, remoteVideoRef);
    }

    const handleBeforeUnload = () => {
      ws?.close();
    };

    // To ensure to close the socket if the user close the window
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Function trigger when the component is unmounted
    return () => {
      //Remove the event listener to be clean
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Manually close the socket as it's not part of the window event listener
      handleBeforeUnload();
    };
  }, []);

  useEffect(() => {
    function startCall() {
      setIsCallStarted(true);
      initiateCall(peerConnection, localVideoRef, sendJsonMessage);
    }

    if (lastJsonMessage) {
      const parsedMessage = webrtcWebSocketEventMessage.parse(lastJsonMessage);
      switch (parsedMessage.type) {
        case "answer":
        case "offer": {
          setUserConnected(true);
          proccessWebRTCMessage(parsedMessage, peerConnection);
          break;
        }
        case "ice-candidate": {
          proccessWebRTCMessage(parsedMessage, peerConnection);
          break;
        }
        case "CALL_ROOM_MESSAGE_HISTORY": {
          if (Array.isArray(parsedMessage.value)) {
            if (parsedMessage.value.length === 0) {
              startCall();
            } else {
              parsedMessage.value.forEach((message) => {
                const parsedMessage = JSON.parse(message);
                proccessWebRTCMessage(parsedMessage, peerConnection);
                if (parsedMessage.type === "offer") {
                  answerCall(peerConnection, localVideoRef, sendJsonMessage);
                  setUserConnected(true);
                  setIsCallStarted(true);
                }
              });
            }
          }
          break;
        }
        case "CALL_ROOM_USER_LEFT": {
          setUserLeft(true);
        }
      }
    }
  }, [lastJsonMessage]);

  function endCall() {
    terminateCall(peerConnection, localVideoRef, remoteVideoRef);
    getWebSocket()?.close();
    navigate("/");
  }

  if (userLeft) {
    return <div>{t("Pages.CallRoom.UserLeft")}</div>;
  }

  return (
    <Col className="w-full h-full gap-10 p-10">
      <Row className="mx-auto gap-0 justify-around">
        <video
          ref={remoteVideoRef}
          autoPlay
          muted={false}
          className={twMerge("h-full w-[50vw] mt-auto", userConnected ? "" : "hidden")}
        />
        <Col
          className={twMerge(
            "h-full w-[50vw] bg-gray-200 rounded-xl justify-center",
            !userConnected ? "" : "hidden"
          )}
        >
          <PrimeSpinnerDotted className="animate-spin h-12 w-12 text-gray-400/80 mx-auto" />
          <p className="text-center font-semibold text-xl text-gray-500">
            {t("Pages.CallRoom.WaitingUserToJoin")}
          </p>
        </Col>
        <video
          ref={localVideoRef}
          autoPlay
          muted={true}
          className={twMerge("w-[15%] mt-auto", userConnected ? "" : "hidden")}
        />
      </Row>
      <Row className="gap-4 mx-auto">
        <Tooltip content={t("Pages.CallRoom.EndCall")}>
          <Button isIconOnly size="lg" color="danger" onPress={endCall} disabled={isCallStarted}>
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
              disabled={isCallStarted}
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
              disabled={isCallStarted}
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
              disabled={isCallStarted}
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
                startScreenShare(peerConnection, localVideoRef);
                setIsScreenSharing(true);
              }}
              disabled={isCallStarted}
            >
              <IconMute />
            </Button>
          </Tooltip>
        )}
        {isVideoHidden ? (
          <Tooltip content={t("Pages.CallRoom.HideVideo")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                toggleMuteAudio(peerConnection);
                setIsVideoHidden(false);
              }}
              disabled={isCallStarted}
            >
              <IconStopVideo />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content={t("Pages.CallRoom.DisplayVideo")}>
            <Button
              isIconOnly
              size="lg"
              color="default"
              onPress={() => {
                startScreenShare(peerConnection, localVideoRef);
                setIsVideoHidden(true);
              }}
              disabled={isCallStarted}
            >
              <IconStartVideo />
            </Button>
          </Tooltip>
        )}
      </Row>
    </Col>
  );
}
