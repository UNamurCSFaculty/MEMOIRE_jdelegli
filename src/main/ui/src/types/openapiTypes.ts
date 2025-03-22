import { schemas } from "@openapi/openapizod";
import { z } from "zod";

export type UserDto = z.infer<typeof schemas.UserDto>;
export type UserPreferencesDto = z.infer<typeof schemas.UserPreferencesDto>;
export type UserAudioPreferencesDto = z.infer<typeof schemas.UserAudioPreferencesDto>;
export type UserFrequencyGainDto = z.infer<typeof schemas.UserFrequencyGainDto>;
export type UserGeneralPreferencesDto = z.infer<typeof schemas.UserGeneralPreferencesDto>;
export type UserVisualPreferencesDto = z.infer<typeof schemas.UserVisualPreferencesDto>;
export type CallRoomDto = z.infer<typeof schemas.CallRoomDto>;
export type ContactDto = z.infer<typeof schemas.ContactDto>;
export type ContactRequestDto = z.infer<typeof schemas.ContactRequestDto>;
