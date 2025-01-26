import { z } from "zod";

export const webrtcWebSocketEventType = z.enum([
  "ice-candidate",
  "offer",
  "answer",
  "CALL_ROOM_MESSAGE_HISTORY",
  "CALL_ROOM_USER_LEFT",
]);

export const webrtcWebSocketEventMessage = z
  .object({
    type: webrtcWebSocketEventType,
    value: z.any(),
  })
  .passthrough();

export type WebrtcWebSocketEventType = z.infer<typeof webrtcWebSocketEventType>;
export type WebrtcWebSocketEventMessage = z.infer<typeof webrtcWebSocketEventMessage>;
