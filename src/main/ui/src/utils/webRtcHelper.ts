// This util file is dedicated to handle and centralize the web rtc logic only
// It is also slightly related to the environement
//    - we display both the local user and the remote user video signal (via React Ref)
//    - we flag data in the web socket message (type field, and the message is in value)

import { MutableRefObject, RefObject } from "react";
import { WebrtcWebSocketEventMessage } from "../types/rtcWebSocketEventMessage";

export function onIceCandidateHandler(
  evt: RTCPeerConnectionIceEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendJsonMessage: (params: any) => void
) {
  if (!evt?.candidate) return;
  else sendJsonMessage({ type: "ice-candidate", value: evt.candidate });
}

export function onTrackHandler(evt: RTCTrackEvent, remoteVideoRef: RefObject<HTMLVideoElement>) {
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = evt.streams[0];
  }
}

export function initiateCall(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  localVideoRef: RefObject<HTMLVideoElement>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendJsonMessage: (params: any) => void
) {
  if (!peerConnection?.current) {
    console.error("Cannot initiate a call before the connection is ready");
  } else {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // we can ignore the "is possibly null" issue on current as already tested in if condition
      stream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, stream));
      createAndSendOffer(peerConnection, sendJsonMessage);
    });
  }
}

export function answerCall(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  localVideoRef: RefObject<HTMLVideoElement>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendJsonMessage: (params: any) => void
) {
  if (!peerConnection?.current) {
    console.error("Cannot answer a call before the connection is ready");
  } else {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // we can ignore the "is possibly null" issue on current as already tested in if condition
      stream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, stream));
      createAndSendAnswer(peerConnection, sendJsonMessage);
    });
  }
}

export function terminateCall(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  localVideoRef: RefObject<HTMLVideoElement>,
  remoteVideoRef: RefObject<HTMLVideoElement>
) {
  if (!peerConnection?.current) {
    console.error("Cannot end a call before the connection is ready");
  } else {
    peerConnection.current.close();
    if (localVideoRef?.current?.srcObject) localVideoRef.current.srcObject = null;
    if (remoteVideoRef?.current?.srcObject) remoteVideoRef.current.srcObject = null;
  }
}

function createAndSendOffer(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendJsonMessage: (params: any) => void
) {
  if (!peerConnection.current) {
    console.error("Peer connection not established");
  } else {
    peerConnection.current
      .createOffer()
      .then((offer) => {
        const offerSessionDesc = new RTCSessionDescription(offer);
        // we can ignore the "is possibly null" issue on current as already tested in if condition
        peerConnection
          .current!.setLocalDescription(offerSessionDesc)
          .then(() => {
            sendJsonMessage({ type: "offer", value: offerSessionDesc });
          })
          .catch((e) => {
            console.error("Error while trying to send offer message: ", e);
          });
      })
      .catch((e) => {
        console.error("Error while trying to generate offer message: ", e);
      });
  }
}

function createAndSendAnswer(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendJsonMessage: (params: any) => void
) {
  if (!peerConnection.current) {
    console.error("Peer connection not established");
  } else {
    peerConnection.current
      .createAnswer()
      .then((answer) => {
        peerConnection
          .current!.setLocalDescription(answer)
          .then(() => {
            sendJsonMessage({ type: "answer", value: answer });
          })
          .catch((e) => {
            console.error("Error while trying to send answer message: ", e);
          });
      })
      .catch((e) => {
        console.error("Error while trying to generate answer message: ", e);
      });
  }
}

export function proccessWebRTCMessage(
  message: WebrtcWebSocketEventMessage,
  peerConnection: MutableRefObject<RTCPeerConnection | null>
) {
  if (!peerConnection.current) {
    console.error("Peer connection not established");
  } else if (message.type === "offer" || message.type === "answer") {
    peerConnection.current
      .setRemoteDescription(new RTCSessionDescription(message.value))
      .catch((e) => {
        console.error("Error while processing remote peer description :", e);
      });
  } else if (message.type === "ice-candidate") {
    peerConnection.current.addIceCandidate(new RTCIceCandidate(message.value)).catch((e) => {
      console.error("Error while processing remote peer ice candidate :", e);
    });
  }
}
