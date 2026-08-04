// This util file is dedicated to handle and centralize the web rtc logic only
//
// A call is a mesh: an RTCPeerConnection is a pipe between exactly two browsers,
// so every participant holds one connection per other participant. Everything
// here therefore works on a single peer at a time, or on the whole set of
// connections when the change concerns what we send to everyone (screen share).
//
// The local tracks are shared by every connection, which is why muting happens
// on the stream itself and why closing one connection must never stop a track.

import { WebrtcSignalType } from "../types/rtcWebSocketEventMessage";

export type SendSignal = (message: {
  type: WebrtcSignalType;
  to: string;
  value: unknown;
}) => void;

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection();
}

export async function createAndSendOffer(
  connection: RTCPeerConnection,
  peerId: string,
  sendSignal: SendSignal,
) {
  if (connection.signalingState !== "stable") {
    // an offer is already being negotiated with this peer, sending another one
    // now would corrupt it
    console.warn("Skipping offer creation, signaling state is:", connection.signalingState);
    return;
  }
  try {
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    sendSignal({ type: "offer", to: peerId, value: connection.localDescription });
  } catch (e) {
    console.error("Error while trying to send an offer to", peerId, e);
  }
}

export async function createAndSendAnswer(
  connection: RTCPeerConnection,
  peerId: string,
  sendSignal: SendSignal,
) {
  try {
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    sendSignal({ type: "answer", to: peerId, value: connection.localDescription });
  } catch (e) {
    console.error("Error while trying to send an answer to", peerId, e);
  }
}

/**
 * @returns true when the description was applied, so the caller knows whether
 *          the buffered candidates may be replayed and an answer produced
 */
export async function applyRemoteDescription(
  connection: RTCPeerConnection,
  description: RTCSessionDescriptionInit,
): Promise<boolean> {
  try {
    await connection.setRemoteDescription(new RTCSessionDescription(description));
    return true;
  } catch (e) {
    console.error("Error while processing a remote peer description:", e);
    return false;
  }
}

/**
 * Closes one peer connection. The local tracks are deliberately left alone:
 * every connection sends the very same track objects, so stopping them here
 * would cut the camera for all the other participants.
 */
export function closePeerConnection(connection: RTCPeerConnection) {
  if (connection.signalingState === "closed") {
    return;
  }
  connection.onicecandidate = null;
  connection.ontrack = null;
  connection.ondatachannel = null;
  connection.close();
}

/**
 * @returns true when the microphone ends up muted
 */
export function toggleMuteAudio(stream: MediaStream | null): boolean {
  if (!stream) {
    return false;
  }
  let muted = false;
  stream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
    muted = !track.enabled;
  });
  return muted;
}

/**
 * @returns true when the camera ends up hidden
 */
export function toggleVideo(stream: MediaStream | null): boolean {
  if (!stream) {
    return false;
  }
  let hidden = false;
  stream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
    hidden = !track.enabled;
  });
  return hidden;
}

/**
 * Swaps what every peer receives as video. replaceTrack does not need a new
 * negotiation, which is what makes screen sharing cheap in a mesh.
 */
export function replaceVideoTrack(connections: RTCPeerConnection[], track: MediaStreamTrack) {
  connections.forEach((connection) => {
    const sender = connection.getSenders().find((s) => s.track?.kind === "video");
    sender?.replaceTrack(track).catch((e) => console.error("Error while replacing a track:", e));
  });
}

export async function acquireScreenStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  } catch (e) {
    console.error("Error starting screen share:", e);
    return null;
  }
}
