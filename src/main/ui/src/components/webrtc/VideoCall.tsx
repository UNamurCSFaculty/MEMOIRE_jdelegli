//Note : this component will be split in the future

import {
  answerCall,
  closeAllConnections,
  initiateCall,
  onIceCandidateHandler,
  onTrackHandler,
  proccessWebRTCMessage,
  terminateCall,
} from "@utils/webRtcHelper";
import { buildWsUrl } from "@utils/webSocketHelper";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useWebSocket from "react-use-websocket";
import { webrtcWebSocketEventMessage } from "../../types/rtcWebSocketEventMessage";
import { twMerge } from "tailwind-merge";
import PrimeSpinnerDotted from "~icons/prime/spinner-dotted";
import Col from "@components/layout/Col";
import { useNavigate } from "react-router-dom";
import VideoCallActionBar from "./VideoCallActionBar";

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
  const [userConnected, setUserConnected] = useState<boolean>(false);
  const [userLeft, setUserLeft] = useState<boolean>(false);

  const closeAllConnectionsAndSessions = () => {
    closeAllConnections(peerConnection, remoteVideoRef, localVideoRef);
    getWebSocket()?.close();
  };

  useEffect(() => {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection();
      peerConnection.current.onicecandidate = (evt) => onIceCandidateHandler(evt, sendJsonMessage);
      peerConnection.current.ontrack = (evt) => onTrackHandler(evt, remoteVideoRef);
    }

    // To ensure to close the socket if the user close the window
    window.addEventListener("beforeunload", closeAllConnectionsAndSessions);

    // Function trigger when the component is unmounted
    return () => {
      //Remove the event listener to be clean
      window.removeEventListener("beforeunload", closeAllConnectionsAndSessions);
      // Manually close the socket as it's not part of the window event listener
      closeAllConnectionsAndSessions();
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
          closeAllConnectionsAndSessions();
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
    <div className="w-screen h-screen bg-black">
      {/* Remote Video - Fullscreen */}
      <video
        ref={remoteVideoRef}
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
          userConnected ? "" : "hidden"
        )}
      />

      {/* Waiting State - Hidden when user is connected */}
      <Col
        className={twMerge(
          "h-full w-full bg-gray-200 rounded-xl flex items-center justify-center",
          userConnected ? "hidden" : ""
        )}
      >
        <PrimeSpinnerDotted className="animate-spin h-12 w-12 text-gray-400/80 mx-auto" />
        <p className="text-center font-semibold text-xl text-gray-500">
          {t("Pages.CallRoom.WaitingUserToJoin")}
        </p>
      </Col>

      {/* Action Bar - Positioned at the bottom of remote video */}
      <VideoCallActionBar
        disabled={!isCallStarted}
        peerConnection={peerConnection}
        localVideoRef={localVideoRef}
        endCall={endCall}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      />
    </div>
  );
}
