import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
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
import { webrtcWebSocketEventMessage } from "@type/rtcWebSocketEventMessage";

/**
 * Handles the whole WebRTC call lifecycle for a room: signaling over the
 * call-room WebSocket, peer connection setup, local media acquisition
 * (honoring the cameraOn policy flag) and call state tracking.
 *
 * isCallee marks the peer that joined through an invitation: it never
 * initiates the offer (even on an empty message history) and only answers,
 * which prevents both sides from sending an offer when they join the room
 * almost simultaneously (e.g. with auto-answer enabled).
 */
export function useWebRtcCall(roomId: string, cameraOn?: boolean | null, isCallee?: boolean) {
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const { getWebSocket, lastJsonMessage, sendJsonMessage } = useWebSocket(
    buildWsUrl("call-room", roomId),
  );

  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [userConnected, setUserConnected] = useState<boolean>(false);
  const [userLeft, setUserLeft] = useState<boolean>(false);
  const [userRejectedCall, setUserRejectedCall] = useState<boolean>(false);

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

    // Request camera/mic permissions early so the popup doesn't interrupt WebRTC negotiation
    navigator.mediaDevices
      .getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true },
        video: true,
      })
      .then((stream) => {
        if (cameraOn === false) {
          stream.getVideoTracks().forEach((t) => (t.enabled = false));
        }
        localStreamRef.current = stream;
      });

    // To ensure to close the socket if the user close the window
    window.addEventListener("beforeunload", closeAllConnectionsAndSessions);

    // Function trigger when the component is unmounted
    return () => {
      //Remove the event listener to be clean
      window.removeEventListener("beforeunload", closeAllConnectionsAndSessions);
      // Manually close the socket as it's not part of the window event listener
      closeAllConnectionsAndSessions();
      // Stop tracks from early permission request if the call never started
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function startCall() {
      setIsCallStarted(true);
      initiateCall(peerConnection, localVideoRef, sendJsonMessage, localStreamRef, cameraOn);
    }

    if (lastJsonMessage) {
      const parsedMessage = webrtcWebSocketEventMessage.parse(lastJsonMessage);
      switch (parsedMessage.type) {
        case "answer": {
          setUserConnected(true);
          proccessWebRTCMessage(parsedMessage, peerConnection);
          break;
        }
        case "offer": {
          setUserConnected(true);
          proccessWebRTCMessage(parsedMessage, peerConnection);
          answerCall(peerConnection, localVideoRef, sendJsonMessage, localStreamRef, cameraOn);
          setIsCallStarted(true);
          break;
        }
        case "ice-candidate": {
          proccessWebRTCMessage(parsedMessage, peerConnection);
          break;
        }
        case "CALL_ROOM_MESSAGE_HISTORY": {
          if (Array.isArray(parsedMessage.value)) {
            if (parsedMessage.value.length === 0) {
              // The callee never initiates: it waits for the caller's offer
              if (!isCallee) {
                startCall();
              }
            } else {
              parsedMessage.value.forEach((message) => {
                const parsedMessage = JSON.parse(message);
                proccessWebRTCMessage(parsedMessage, peerConnection);
                if (parsedMessage.type === "offer") {
                  answerCall(peerConnection, localVideoRef, sendJsonMessage, localStreamRef, cameraOn);
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
          break;
        }
        case "CALL_ROOM_USER_REJECTED_CALL": {
          setUserRejectedCall(true);
          closeAllConnectionsAndSessions();
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  function endCall() {
    terminateCall(peerConnection, localVideoRef, remoteVideoRef);
    getWebSocket()?.close();
  }

  return {
    localVideoRef,
    remoteVideoRef,
    peerConnection,
    isCallStarted,
    userConnected,
    userLeft,
    userRejectedCall,
    endCall,
  };
}
