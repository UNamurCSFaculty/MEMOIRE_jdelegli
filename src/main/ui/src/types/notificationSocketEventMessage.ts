import { z } from "zod";

export const notificationSocketEventType = z.enum([
  "CALL_ROOM_INVITATION",
  "NOTIFICATION_CONNECTED_USER_LIST",
  "NOTIFICATION_NEW_USER_CONNECTED",
  "NOTIFICATION_USER_LEFT",
]);

export const notificationSocketEventMessage = z
  .object({
    type: notificationSocketEventType,
    value: z.any(),
  })
  .passthrough();

export const callRoomInvitationMessageContent = z
  .object({
    roomId: z.string(),
    userId: z.string(),
  })
  .passthrough();

export type NotificationSocketEventType = z.infer<typeof notificationSocketEventType>;
export type NotificationSocketEventMessage = z.infer<typeof notificationSocketEventMessage>;

export type CallRoomInvitationMessageContent = z.infer<typeof callRoomInvitationMessageContent>;
