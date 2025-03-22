import { UserDto, UserPreferencesDto } from "@type/openapiTypes";
import { createContext } from "react";

export interface UserAuthContextType {
  user: UserDto | null;
  userPreferences: UserPreferencesDto | null;
  status: "loading" | "idle";
  error?: string;
  refreshUserPreferences?: () => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  userPreferences: null,
  status: "loading",
});
