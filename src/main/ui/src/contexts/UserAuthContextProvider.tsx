import { ReactNode, useEffect, useState } from "react";
import { UserAuthContext, UserAuthContextType } from "./contexts";
import { apiClient } from "@openapi/zodiosClient";

interface UserAuthContextProps {
  children: ReactNode;
}

export default function UserAuthContextProvider({ children }: Readonly<UserAuthContextProps>) {
  const [userAuth, setUserAuth] = useState<UserAuthContextType>({ user: null, status: "loading" });

  useEffect(() => {
    apiClient
      .getCurrentUser()
      .then((resp) => {
        setUserAuth({
          user: resp,
          status: "idle",
        });
      })
      .catch((e) => {
        setUserAuth((curr) => ({
          user: curr.user,
          status: "idle",
          error: JSON.stringify(e, null, 2),
        }));
        console.error("Error while fetching user : ", e);
      });
  }, []);

  return userAuth.status === "idle" ? (
    <UserAuthContext.Provider value={userAuth}>{children}</UserAuthContext.Provider>
  ) : (
    <p>connecting</p>
  );
}
