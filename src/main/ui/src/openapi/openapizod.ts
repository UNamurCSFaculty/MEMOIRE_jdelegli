import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CreateCallRoomBody = z
  .object({
    userIds: z
      .array(
        z
          .string()
          .regex(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/)
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
    method: "get",
    path: "/elder-rings/api/hello",
    alias: "getElderRingsapihello",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/elder-rings/api/hello/greeting/:name",
    alias: "getElderRingsapihellogreetingName",
    requestFormat: "json",
    parameters: [
      {
        name: "name",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/elder-rings/api/user/:userId/set-picture",
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
      {
        name: "userId",
        type: "Path",
        schema: z
          .string()
          .regex(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/)
          .uuid(),
      },
    ],
    response: z
      .string()
      .regex(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/)
      .uuid(),
  },
  {
    method: "get",
    path: "/elder-rings/api/user/me",
    alias: "getCurrentUser",
    requestFormat: "json",
    response: UserDto,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
