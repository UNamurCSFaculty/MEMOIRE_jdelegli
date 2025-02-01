import { UserDto } from "@type/openapiTypes";
import { createContext } from "react";

export interface UserAuthContextType {
  user: UserDto | null;
  status: "loading" | "idle";
  error?: string;
}

export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  status: "loading",
});
