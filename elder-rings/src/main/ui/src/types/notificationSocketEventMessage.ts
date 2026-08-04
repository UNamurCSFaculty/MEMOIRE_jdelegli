import { z } from "zod";

export const notificationSocketEventType = z.enum([
  "CALL_ROOM_INVITATION",
  "NOTIFICATION_CONNECTED_USER_LIST",
  "NOTIFICATION_NEW_USER_CONNECTED",
  "NOTIFICATION_USER_LEFT",
  "PREFERENCES_UPDATED",
  "CALL_ROOM_USER_LEFT",
  "TV_POWER",
  "USER_UPDATED",
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
    autoAnswer: z.boolean().nullish(),
    cameraOn: z.boolean().nullish(),
  })
  .passthrough();

export type NotificationSocketEventType = z.infer<typeof notificationSocketEventType>;
export type NotificationSocketEventMessage = z.infer<typeof notificationSocketEventMessage>;

export type CallRoomInvitationMessageContent = z.infer<typeof callRoomInvitationMessageContent>;
