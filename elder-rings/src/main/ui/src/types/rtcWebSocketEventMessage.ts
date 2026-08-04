import { z } from "zod";

export const webrtcWebSocketEventType = z.enum([
  "SIGNAL",
  "CALL_ROOM_PARTICIPANTS",
  "CALL_ROOM_USER_JOINED",
  "CALL_ROOM_USER_LEFT",
  "CALL_ROOM_USER_REJECTED_CALL",
]);

/**
 * The negotiation traffic of one peer, carried inside a SIGNAL message so that
 * peer traffic can never be confused with a room event.
 */
export const webrtcSignalType = z.enum(["offer", "answer", "ice-candidate"]);

export const webrtcWebSocketEventMessage = z
  .object({
    type: webrtcWebSocketEventType,
    value: z.any(),
    // both are set by the server on SIGNAL messages only
    from: z.string().optional(),
    signalType: webrtcSignalType.optional(),
  })
  .passthrough();

export type WebrtcWebSocketEventType = z.infer<typeof webrtcWebSocketEventType>;
export type WebrtcWebSocketEventMessage = z.infer<typeof webrtcWebSocketEventMessage>;
export type WebrtcSignalType = z.infer<typeof webrtcSignalType>;
