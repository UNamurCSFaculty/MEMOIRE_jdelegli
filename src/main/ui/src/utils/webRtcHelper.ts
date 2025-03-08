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

export function closeAllConnections(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  remoteVideoRef: RefObject<HTMLVideoElement>,
  localVideoRef: RefObject<HTMLVideoElement>
) {
  // 1. close all WebRTC peer connections
  if (peerConnection.current && peerConnection.current.signalingState !== "closed") {
    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) sender.track.stop();
      peerConnection.current?.removeTrack(sender);
    });
    peerConnection.current.close();
    peerConnection.current = null;
  }
  // 2. Stop local media tracks
  if (localVideoRef.current?.srcObject) {
    const stream = localVideoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    localVideoRef.current.srcObject = null;
  }
  // 2. Stop remote media tracks
  if (remoteVideoRef.current?.srcObject) {
    const stream = remoteVideoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    remoteVideoRef.current.srcObject = null;
  }
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

export function stopScreenShare(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  localVideoRef: RefObject<HTMLVideoElement>
) {
  if (!peerConnection.current) {
    console.error("Cannot stop screen share before the connection is established.");
    return;
  }

  // Get back the webcam stream
  navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
    const webcamTrack = stream.getVideoTracks()[0];

    // Restore local video to webcam feed
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Replace the screen-sharing track with webcam track
    const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === "video");

    if (sender) {
      sender.replaceTrack(webcamTrack);
    }
  });
}

export function startScreenShare(
  peerConnection: MutableRefObject<RTCPeerConnection | null>,
  localVideoRef: RefObject<HTMLVideoElement>
) {
  if (!peerConnection.current) {
    console.error("Cannot share screen before the connection is established.");
    return;
  }

  navigator.mediaDevices
    .getDisplayMedia({ video: true, audio: false }) // Set `audio: true` if needed
    .then((screenStream) => {
      const screenTrack = screenStream.getVideoTracks()[0];

      // Display screen in local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Replace the existing video track in the connection
      const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      // Stop sharing when the user ends it
      screenTrack.onended = () => {
        stopScreenShare(peerConnection, localVideoRef);
      };
    })
    .catch((error) => console.error("Error starting screen share:", error));
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
    closeAllConnections(peerConnection, remoteVideoRef, localVideoRef);
  }
}

export function toggleMuteAudio(peerConnection: MutableRefObject<RTCPeerConnection | null>) {
  peerConnection.current?.getSenders().forEach((sender) => {
    if (sender.track?.kind === "audio") {
      sender.track.enabled = !sender.track.enabled;
    }
  });
}

export function toggleVideo(peerConnection: MutableRefObject<RTCPeerConnection | null>) {
  peerConnection.current?.getSenders().forEach((sender) => {
    if (sender.track?.kind === "video") {
      sender.track.enabled = !sender.track.enabled;
    }
  });
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
