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
export type TextSizeDto = z.infer<typeof schemas.TextSizeDto>;
export type AutonomyLevel = z.infer<typeof schemas.AutonomyLevel>;
export type ResidentDto = z.infer<typeof schemas.ResidentDto>;
export type UserDndWindowDto = z.infer<typeof schemas.UserDndWindowDto>;

// Value list for enums
export const textSizeDtoValues = schemas.TextSizeDto._def.values;
export const autonomyLevelValues = schemas.AutonomyLevel._def.values;
export const dayOfWeekValues = schemas.DayOfWeek._def.values;
