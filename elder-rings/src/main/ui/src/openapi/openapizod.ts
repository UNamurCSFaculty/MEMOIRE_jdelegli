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
const RejectCallRoomInvitationBody = z
  .object({
    roomId: UUID.regex(
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
  .object({
    lang: z.string(),
    isPublic: z.boolean(),
    doNotDisturb: z.boolean(),
  })
  .partial()
  .passthrough();
const TextSizeDto = z.enum(["SM", "MD", "LG", "XL", "XXL"]);
const UserVisualPreferencesDto = z
  .object({ textSize: TextSizeDto, readTextOnScreen: z.boolean() })
  .partial()
  .passthrough();
const UserFrequencyGainDto = z
  .object({ frequency: z.number().int(), gain: z.number() })
  .partial()
  .passthrough();
const UserAudioPreferencesDto = z
  .object({
    compression: z.boolean(),
    filters: z.array(UserFrequencyGainDto),
    playInterfaceSounds: z.boolean(),
  })
  .partial()
  .passthrough();
const UserCallPolicyPreferencesDto = z
  .object({ autoAnswer: z.boolean(), cameraOnByDefault: z.boolean() })
  .partial()
  .passthrough();
const UserPreferencesDto = z
  .object({
    general: UserGeneralPreferencesDto,
    visual: UserVisualPreferencesDto,
    audio: UserAudioPreferencesDto,
    callPolicy: UserCallPolicyPreferencesDto,
  })
  .partial()
  .passthrough();
const UserType = z.enum(["RESIDENT", "FAMILY", "STAFF"]);
const ContactDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    userType: UserType,
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
    userType: UserType,
    tutorOfResidentId: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
  })
  .partial()
  .passthrough();
const AutonomyLevel = z.enum(["AUTONOMOUS", "INTERMEDIATE", "DEPENDENT"]);
const ResidentDto = z
  .object({
    id: UUID.regex(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    ).uuid(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    autonomyLevel: AutonomyLevel,
    picture: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ResidentSettingsDto = z
  .object({ autonomyLevel: AutonomyLevel })
  .partial()
  .passthrough();

export const schemas = {
  CreateCallRoomBody,
  UUID,
  CallRoomDto,
  RejectCallRoomInvitationBody,
  ContactRequestStatusDto,
  Instant,
  ContactRequestDto,
  UserGeneralPreferencesDto,
  TextSizeDto,
  UserVisualPreferencesDto,
  UserFrequencyGainDto,
  UserAudioPreferencesDto,
  UserCallPolicyPreferencesDto,
  UserPreferencesDto,
  UserType,
  ContactDto,
  UserDto,
  AutonomyLevel,
  ResidentDto,
  ResidentSettingsDto,
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
    path: "/elder-rings/api/call-room/reject",
    alias: "rejectCallRoomInvitation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RejectCallRoomInvitationBody,
      },
    ],
    response: z.void(),
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
    method: "get",
    path: "/elder-rings/api/media/sounds/:filename",
    alias: "getElderRingsapimediasoundsFilename",
    requestFormat: "json",
    parameters: [
      {
        name: "filename",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/elder-rings/api/room-login",
    alias: "getElderRingsapiroomLogin",
    requestFormat: "json",
    parameters: [
      {
        name: "roomId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
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
    response: UserPreferencesDto,
  },
  {
    method: "get",
    path: "/elder-rings/api/user-preferences",
    alias: "getCurrentUserPreferences",
    requestFormat: "json",
    response: UserPreferencesDto,
  },
  {
    method: "put",
    path: "/elder-rings/api/user-preferences/of-user",
    alias: "updateUserPreferences",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserPreferencesDto,
      },
      {
        name: "userId",
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
    response: UserPreferencesDto,
  },
  {
    method: "get",
    path: "/elder-rings/api/user-preferences/of-user",
    alias: "getUserPreferences",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
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
    response: UserPreferencesDto,
  },
  {
    method: "get",
    path: "/elder-rings/api/user/general-preferences",
    alias: "getUserGeneralPreferences",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
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
    response: UserGeneralPreferencesDto,
  },
  {
    method: "get",
    path: "/elder-rings/api/user/get",
    alias: "getUser",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
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
    response: ContactDto,
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
    method: "get",
    path: "/elder-rings/api/user/me/picture",
    alias: "getCurrentUserPicture",
    requestFormat: "json",
    response: z.string(),
  },
  {
    method: "get",
    path: "/elder-rings/api/user/picture",
    alias: "getUserPicture",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
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
    response: z.string(),
  },
  {
    method: "get",
    path: "/elder-rings/api/user/residents",
    alias: "getResidents",
    requestFormat: "json",
    response: z.array(ContactDto),
    errors: [
      {
        status: 401,
        description: `Not Authorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Not Allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/elder-rings/api/user/residents/detail",
    alias: "getResident",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
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
    response: ResidentDto,
  },
  {
    method: "put",
    path: "/elder-rings/api/user/residents/settings",
    alias: "updateResidentSettings",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ResidentSettingsDto,
      },
      {
        name: "userId",
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
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Not Authorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Not Allowed`,
        schema: z.void(),
      },
    ],
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
  {
    method: "post",
    path: "/elder-rings/api/user/set-picture/of-user",
    alias: "setUserPictureOfUser",
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
      {
        name: "userId",
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
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
