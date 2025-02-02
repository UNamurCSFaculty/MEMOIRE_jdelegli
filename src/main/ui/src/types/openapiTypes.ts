import { schemas } from "@openapi/openapizod";
import { z } from "zod";

export type UserDto = z.infer<typeof schemas.UserDto>;
export type CallRoomDto = z.infer<typeof schemas.CallRoomDto>;
export type ContactDto = z.infer<typeof schemas.ContactDto>;
