import { ReactNode, useEffect, useState } from "react";
import { UserAuthContext, UserAuthContextType } from "./contexts";
import { apiClient } from "@openapi/zodiosClient";

interface UserAuthContextProps {
  children: ReactNode;
}

export default function UserAuthContextProvider({ children }: Readonly<UserAuthContextProps>) {
  const [userAuth, setUserAuth] = useState<UserAuthContextType>({
    user: null,
    userPreferences: null,
    status: "loading",
  });

  useEffect(() => {
    const fetchUserAndPreferences = async () => {
      try {
        const [user, preferences] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getCurrentUserPreferences(),
        ]);

        setUserAuth({
          user,
          userPreferences: preferences,
          status: "idle",
          refreshUserPreferences,
        });
      } catch (e) {
        setUserAuth((curr) => ({
          ...curr,
          status: "idle",
          error: JSON.stringify(e, null, 2),
        }));
        console.error("Error while fetching user or preferences: ", e);
      }
    };

    const refreshUserPreferences = async () => {
      try {
        const preferences = await apiClient.getCurrentUserPreferences();
        setUserAuth((curr) => ({
          ...curr,
          userPreferences: preferences,
        }));
      } catch (e) {
        console.error("Failed to refresh preferences", e);
      }
    };

    fetchUserAndPreferences();
  }, []);

  return userAuth.status === "idle" ? (
    <UserAuthContext.Provider value={userAuth}>{children}</UserAuthContext.Provider>
  ) : (
    <p>connecting</p>
  );
}
