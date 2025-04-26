import { UserAuthContext } from "@contexts/contexts";
import { UserPreferencesDto } from "@type/openapiTypes";
import { useContext } from "react";

export function useUserPreferences(): {
  userPreferences: UserPreferencesDto;
  refreshUserPreferences: () => Promise<void>;
} {
  const ctx = useContext(UserAuthContext);

  if (!ctx?.userPreferences || !ctx.refreshUserPreferences) {
    throw new Error("UserContext is undefined. Make sure to use UserAuthContextProvider.");
  }

  return {
    userPreferences: ctx.userPreferences,
    refreshUserPreferences: ctx.refreshUserPreferences,
  };
}
