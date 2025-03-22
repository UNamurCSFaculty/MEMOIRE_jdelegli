import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CreateCallRoomBody = z
  .object({
    userIds: z
      .array(
        z
          .string()
          .regex(
            /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
          )
          .uuid()
      )
      .min(1)
      .max(1),
  })
  .passthrough();
const UUID = z.string();
const CallRoomDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
  })
  .passthrough();
const ContactRequestStatusDto = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);
const Instant = z.string();
const ContactRequestDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    requesterId: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    targetId: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    status: ContactRequestStatusDto,
    createdAt: Instant.datetime({ offset: true }),
    updatedAt: Instant.datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const UserGeneralPreferencesDto = z
  .object({ lang: z.string(), isPublic: z.boolean(), public: z.boolean() })
  .partial()
  .passthrough();
const UserVisualPreferencesDto = z
  .object({ textSize: z.string(), readTextOnScreen: z.boolean() })
  .partial()
  .passthrough();
const UserFrequencyGainDto = z
  .object({ frequency: z.number().int(), gain: z.number() })
  .partial()
  .passthrough();
const UserAudioPreferencesDto = z
  .object({
    noiseReduction: z.boolean(),
    filters: z.array(UserFrequencyGainDto),
  })
  .partial()
  .passthrough();
const UserPreferencesDto = z
  .object({
    general: UserGeneralPreferencesDto,
    visual: UserVisualPreferencesDto,
    audio: UserAudioPreferencesDto,
  })
  .partial()
  .passthrough();
const ContactDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isRoom: z.boolean(),
    picture: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const UserDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isRoom: z.boolean(),
  })
  .partial()
  .passthrough();

export const schemas = {
  CreateCallRoomBody,
  UUID,
  CallRoomDto,
  ContactRequestStatusDto,
  Instant,
  ContactRequestDto,
  UserGeneralPreferencesDto,
  UserVisualPreferencesDto,
  UserFrequencyGainDto,
  UserAudioPreferencesDto,
  UserPreferencesDto,
  ContactDto,
  UserDto,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/elder-rings/api/call-room",
    alias: "createCallRoom",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateCallRoomBody,
      },
    ],
    response: CallRoomDto,
  },
  {
    method: "post",
    path: "/elder-rings/api/contact-management",
    alias: "createContactRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "targetId",
        type: "Query",
        schema: z
          .string()
          .regex(
            /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
          )
          .uuid()
          .optional(),
      },
    ],
    response: z
      .string()
      .regex(
        /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
      )
      .uuid(),
  },
  {
    method: "post",
    path: "/elder-rings/api/contact-management/:requestId/response",
    alias: "respondToContactRequest",
    requestFormat: "json",
    parameters: [
      {
        name: "requestId",
        type: "Path",
        schema: z
          .string()
          .regex(
            /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
          )
          .uuid(),
      },
      {
        name: "accepted",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/elder-rings/api/contact-management/pending",
    alias: "getPendingRequests",
    requestFormat: "json",
    response: z.array(ContactRequestDto),
  },
  {
    method: "put",
    path: "/elder-rings/api/user-preferences",
    alias: "updateCurrentUserPreferences",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserPreferencesDto,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/elder-rings/api/user-preferences",
    alias: "getCurrentUserPreferences",
    requestFormat: "json",
    response: UserPreferencesDto,
  },
  {
    method: "get",
    path: "/elder-rings/api/user/get-contacts",
    alias: "getContact",
    requestFormat: "json",
    response: z.array(ContactDto),
  },
  {
    method: "get",
    path: "/elder-rings/api/user/get-visible-users",
    alias: "getVisibleUsers",
    requestFormat: "json",
    response: z.array(ContactDto),
  },
  {
    method: "get",
    path: "/elder-rings/api/user/me",
    alias: "getCurrentUser",
    requestFormat: "json",
    response: UserDto,
  },
  {
    method: "post",
    path: "/elder-rings/api/user/set-picture",
    alias: "setUserPicture",
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ file: z.instanceof(File) })
          .partial()
          .passthrough(),
      },
    ],
    response: z
      .string()
      .regex(
        /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
      )
      .uuid(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
