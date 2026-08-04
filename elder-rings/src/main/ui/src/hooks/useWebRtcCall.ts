import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { notifyWarning } from "@utils/notifyUtil";
import { buildWsUrl } from "@utils/webSocketHelper";
import { webrtcWebSocketEventMessage } from "@type/rtcWebSocketEventMessage";
import {
  SendSignal,
  acquireScreenStream,
  applyRemoteDescription,
  closePeerConnection,
  createAndSendAnswer,
  createAndSendOffer,
  createPeerConnection,
  replaceVideoTrack,
} from "@utils/webRtcHelper";
import { useUser } from "./useUser";

const CAPTIONS_CHANNEL = "captions";
/** a caption is what someone is saying, not a label: it has to fade */
const CAPTION_TTL_MS = 5000;

interface PeerState {
  connection: RTCPeerConnection;
  captions: RTCDataChannel | null;
  /** candidates received before the description they belong to */
  pendingCandidates: RTCIceCandidateInit[];
  /**
   * Resolves once the local tracks are attached to this connection, with false
   * when there is no local media at all. Answering an offer before that would
   * produce a receive only answer that nothing would ever renegotiate, so both
   * sides wait on it before touching the connection.
   */
  ready: Promise<boolean>;
}

export interface CallParticipant {
  userId: string;
  stream: MediaStream | null;
}

/**
 * Handles the whole WebRTC call lifecycle for a room, for any number of
 * participants: signaling over the call-room WebSocket, one peer connection per
 * other participant, local media acquisition (honoring the cameraOn policy flag)
 * and call state tracking.
 *
 * Who sends the offer is decided by a symmetric rule rather than by the order of
 * arrival: in a pair, the participant with the smaller id offers and the other
 * one answers. Both sides evaluate it on their own, so exactly one offer is sent
 * whoever joined first, and two people joining at the same time cannot collide.
 */
export function useWebRtcCall(roomId: string, cameraOn?: boolean | null) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUser();
  const myId = user.id ?? "";

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localStreamPromise = useRef<Promise<MediaStream> | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerState>>(new Map());
  const captionTimersRef = useRef<Map<string, number>>(new Map());
  /**
   * Who the server says is in the room. The connections are derived from it,
   * never the opposite: a signal must not be able to bring back a participant
   * that already left, which would leave a ghost tile and a call unable to end.
   */
  const membersRef = useRef<Set<string>>(new Set());
  /** everything asynchronous checks this before touching the call again */
  const closedRef = useRef<boolean>(false);
  /** always points at the latest message handler, see the onMessage below */
  const messageHandlerRef = useRef<(data: string) => void>(() => undefined);

  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [userRejectedCall, setUserRejectedCall] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<boolean>(false);

  const { getWebSocket, sendJsonMessage } = useWebSocket(buildWsUrl("call-room", roomId), {
    // every single frame has to be handled: the library stores the last one in
    // a state, so two frames arriving in the same tick would be coalesced and
    // the first one silently lost. An answer swallowed by the ice candidate
    // right behind it would leave that peer negotiating for ever.
    onMessage: (event: MessageEvent) => messageHandlerRef.current(event.data),
  });

  /** nothing reaches the socket once the call is closed: it would be queued
   *  for a connection that will never reopen */
  const sendSignal: SendSignal = useCallback(
    (message) => {
      if (closedRef.current) {
        return;
      }
      sendJsonMessage(message);
    },
    [sendJsonMessage],
  );

  /**
   * The camera and microphone are acquired once and shared by every peer
   * connection, so the permission popup is only shown a single time.
   */
  const ensureLocalStream = useCallback(() => {
    if (!localStreamPromise.current) {
      localStreamPromise.current = navigator.mediaDevices
        .getUserMedia({
          audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true },
          video: true,
        })
        .then((stream) => {
          if (closedRef.current) {
            // the call was left while the permission popup was still open: the
            // camera and the microphone must not stay live
            stream.getTracks().forEach((track) => track.stop());
            throw new Error("The call was closed before the media was ready");
          }
          if (cameraOn === false) {
            stream.getVideoTracks().forEach((track) => (track.enabled = false));
          }
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setIsCallStarted(true);
          return stream;
        })
        .catch((e) => {
          // a rejected promise must not be kept, otherwise every later peer
          // would fail without ever retrying
          localStreamPromise.current = null;
          if (!closedRef.current) {
            setMediaError(true);
          }
          throw e;
        });
    }
    return localStreamPromise.current;
  }, [cameraOn]);

  const forgetCaption = (peerId: string) => {
    const timer = captionTimersRef.current.get(peerId);
    if (timer) {
      window.clearTimeout(timer);
    }
    captionTimersRef.current.delete(peerId);
  };

  const showCaption = useCallback((peerId: string, text: string) => {
    setCaptions((current) => ({ ...current, [peerId]: text }));
    forgetCaption(peerId);
    captionTimersRef.current.set(
      peerId,
      window.setTimeout(() => {
        captionTimersRef.current.delete(peerId);
        setCaptions((current) => ({ ...current, [peerId]: "" }));
      }, CAPTION_TTL_MS),
    );
  }, []);

  const closeEverything = useCallback(() => {
    closedRef.current = true;

    peersRef.current.forEach((peer) => closePeerConnection(peer.connection));
    peersRef.current.clear();
    membersRef.current.clear();
    captionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    captionTimersRef.current.clear();
    setParticipants([]);

    // the local tracks are stopped here only: they are shared by every peer.
    // a stream still being acquired is stopped by the guard in ensureLocalStream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    getWebSocket()?.close();
  }, [getWebSocket]);

  const getOrCreatePeer = useCallback(
    (peerId: string): PeerState => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        return existing;
      }

      const connection = createPeerConnection();
      const peer: PeerState = {
        connection,
        captions: null,
        pendingCandidates: [],
        ready: Promise.resolve(false),
      };

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({ type: "ice-candidate", to: peerId, value: event.candidate });
        }
      };

      connection.ontrack = (event) => {
        const [stream] = event.streams;
        setParticipants((current) =>
          current.map((participant) =>
            participant.userId === peerId ? { ...participant, stream } : participant,
          ),
        );
      };

      // the peer that offers creates the captions channel, the other one
      // receives it here
      connection.ondatachannel = (event) => {
        if (event.channel.label !== CAPTIONS_CHANNEL) {
          return;
        }
        peer.captions = event.channel;
        event.channel.onmessage = (message: MessageEvent) => showCaption(peerId, message.data);
      };

      peer.ready = ensureLocalStream()
        .then((stream) => {
          if (closedRef.current || peersRef.current.get(peerId) !== peer) {
            return false;
          }
          stream.getTracks().forEach((track) => connection.addTrack(track, stream));

          // a share started before this peer joined: it must receive the screen
          const screenTrack = screenStreamRef.current?.getVideoTracks()[0];
          if (screenTrack) {
            replaceVideoTrack([connection], screenTrack);
          }
          return true;
        })
        .catch((e) => {
          console.error("Could not attach the local media for", peerId, e);
          return false;
        });

      // registered before anything asynchronous so two messages about the same
      // peer arriving back to back cannot build two connections
      peersRef.current.set(peerId, peer);

      setParticipants((current) =>
        current.some((participant) => participant.userId === peerId)
          ? current
          : [...current, { userId: peerId, stream: null }],
      );

      return peer;
    },
    [ensureLocalStream, sendSignal, showCaption],
  );

  /** true while this peer is still the live one for that id */
  const isCurrent = (peerId: string, peer: PeerState) =>
    !closedRef.current && peersRef.current.get(peerId) === peer;

  const flushPendingCandidates = async (peer: PeerState) => {
    // shifted one by one: a failure must not throw away the ones left
    while (peer.pendingCandidates.length > 0) {
      const candidate = peer.pendingCandidates.shift();
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error while processing a buffered remote peer ice candidate :", e);
      }
    }
  };

  const removePeer = useCallback((peerId: string) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      closePeerConnection(peer.connection);
      peer.pendingCandidates.length = 0;
      peersRef.current.delete(peerId);
    }
    forgetCaption(peerId);
    setParticipants((current) => current.filter((participant) => participant.userId !== peerId));
    setCaptions((current) => {
      const next = { ...current };
      delete next[peerId];
      return next;
    });
  }, []);

  const connectToPeer = useCallback(
    async (peerId: string) => {
      if (closedRef.current || !peerId || peerId === myId) {
        return;
      }
      const peer = getOrCreatePeer(peerId);
      const hasMedia = await peer.ready;
      if (!isCurrent(peerId, peer)) {
        return;
      }

      if (myId < peerId) {
        if (!hasMedia) {
          // no camera nor microphone here: negotiate anyway so the others can
          // still be seen and heard, we simply send nothing
          peer.connection.addTransceiver("audio", { direction: "recvonly" });
          peer.connection.addTransceiver("video", { direction: "recvonly" });
        }
        if (!peer.captions) {
          peer.captions = peer.connection.createDataChannel(CAPTIONS_CHANNEL);
          peer.captions.onmessage = (message: MessageEvent) => showCaption(peerId, message.data);
        }
        await createAndSendOffer(peer.connection, peerId, sendSignal);
      }
    },
    [getOrCreatePeer, myId, sendSignal, showCaption],
  );

  const handleSignal = useCallback(
    async (
      from: string,
      signalType: string,
      value: RTCSessionDescriptionInit & RTCIceCandidateInit,
    ) => {
      if (closedRef.current || !membersRef.current.has(from)) {
        return;
      }

      // only an offer legitimately precedes any local knowledge of a peer: an
      // answer or a candidate for an unknown peer is a leftover
      const known = peersRef.current.get(from);
      if (!known && signalType !== "offer") {
        return;
      }

      const peer = known ?? getOrCreatePeer(from);
      await peer.ready;
      if (!isCurrent(from, peer)) {
        return;
      }

      switch (signalType) {
        case "offer": {
          if (!(await applyRemoteDescription(peer.connection, value))) {
            // half negotiated is worse than absent: drop it so a later join
            // rebuilds a clean pair
            removePeer(from);
            break;
          }
          if (!isCurrent(from, peer)) {
            break;
          }
          await flushPendingCandidates(peer);
          if (!isCurrent(from, peer)) {
            break;
          }
          await createAndSendAnswer(peer.connection, from, sendSignal);
          break;
        }
        case "answer": {
          if (await applyRemoteDescription(peer.connection, value)) {
            await flushPendingCandidates(peer);
          }
          break;
        }
        case "ice-candidate": {
          if (!peer.connection.remoteDescription) {
            // a candidate is useless until the description it belongs to is set
            peer.pendingCandidates.push(value);
          } else {
            try {
              await peer.connection.addIceCandidate(new RTCIceCandidate(value));
            } catch (e) {
              console.error("Error while processing remote peer ice candidate :", e);
            }
          }
          break;
        }
      }
    },
    [getOrCreatePeer, removePeer, sendSignal],
  );

  const leaveEmptyCall = useCallback(() => {
    notifyWarning(t("Pages.CallRoom.UserLeftCall"));
    closeEverything();
    navigate("/");
  }, [closeEverything, navigate, t]);

  const handleSocketMessage = useCallback(
    (data: string) => {
      if (closedRef.current) {
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(data);
      } catch (e) {
        console.warn("Ignoring a malformed call room message", e);
        return;
      }

      const parsed = webrtcWebSocketEventMessage.safeParse(payload);
      if (!parsed.success) {
        console.warn("Ignoring an unknown call room message", payload);
        return;
      }
      const message = parsed.data;

      switch (message.type) {
        case "CALL_ROOM_PARTICIPANTS": {
          // we just joined: connect to everyone already in the call
          const peerIds = Array.isArray(message.value) ? (message.value as string[]) : [];
          membersRef.current = new Set(peerIds);
          peerIds.forEach((peerId) =>
            connectToPeer(peerId).catch((e) => console.error("Could not connect to", peerId, e)),
          );
          break;
        }

        case "CALL_ROOM_USER_JOINED": {
          const peerId = message.value as string;
          membersRef.current.add(peerId);
          // a peer coming back after a dropped socket must not reuse the old
          // connection, it would never negotiate again
          if (peersRef.current.has(peerId)) {
            removePeer(peerId);
          }
          connectToPeer(peerId).catch((e) => console.error("Could not connect to", peerId, e));
          break;
        }

        case "SIGNAL": {
          if (message.from && message.signalType) {
            handleSignal(message.from, message.signalType, message.value).catch((e) =>
              console.error("Could not handle a signal from", message.from, e),
            );
          }
          break;
        }

        case "CALL_ROOM_USER_LEFT": {
          // only that peer is torn down, the call goes on with the others
          const peerId = message.value as string;
          membersRef.current.delete(peerId);
          removePeer(peerId);
          if (membersRef.current.size === 0) {
            leaveEmptyCall();
          }
          break;
        }

        case "CALL_ROOM_USER_REJECTED_CALL": {
          // someone declining only ends the call while nobody else is there
          if (membersRef.current.size === 0) {
            setUserRejectedCall(true);
            closeEverything();
          }
          break;
        }
      }
    },
    [connectToPeer, handleSignal, removePeer, closeEverything, leaveEmptyCall],
  );

  // no dependency array: the socket callback must always reach the latest
  // closure, whatever re-render happened since
  useEffect(() => {
    messageHandlerRef.current = handleSocketMessage;
  });

  useEffect(() => {
    closedRef.current = false;

    // ask for the camera and the microphone early so the popup does not
    // interrupt the WebRTC negotiation
    ensureLocalStream().catch(() => undefined);

    // To ensure to close the socket if the user close the window
    window.addEventListener("beforeunload", closeEverything);

    return () => {
      window.removeEventListener("beforeunload", closeEverything);
      closeEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendCaption = useCallback((caption: string) => {
    peersRef.current.forEach((peer) => {
      if (peer.captions?.readyState === "open") {
        peer.captions.send(caption);
      }
    });
  }, []);

  const connections = () => Array.from(peersRef.current.values()).map((peer) => peer.connection);

  const stopScreenShare = useCallback(() => {
    if (closedRef.current) {
      return;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (cameraTrack) {
      replaceVideoTrack(connections(), cameraTrack);
    }
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    const screenStream = await acquireScreenStream();
    if (!screenStream) {
      return;
    }
    if (closedRef.current) {
      screenStream.getTracks().forEach((track) => track.stop());
      return;
    }
    screenStreamRef.current = screenStream;
    const screenTrack = screenStream.getVideoTracks()[0];
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
    }
    replaceVideoTrack(connections(), screenTrack);
    // the browser has its own "stop sharing" control
    screenTrack.onended = () => stopScreenShare();
    setIsScreenSharing(true);
  }, [stopScreenShare]);

  const endCall = useCallback(() => closeEverything(), [closeEverything]);

  return {
    localVideoRef,
    localStreamRef,
    participants,
    captions,
    isCallStarted,
    isScreenSharing,
    userRejectedCall,
    mediaError,
    sendCaption,
    startScreenShare,
    stopScreenShare,
    endCall,
  };
}
