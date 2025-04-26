import { UserAuthContext } from "@contexts/contexts";
import { UserDto } from "@type/openapiTypes";
import { useContext } from "react";

export function useUser(): UserDto {
  const ctx = useContext(UserAuthContext);

  if (!ctx?.user) {
    throw new Error("UserContext in undefined. Make sure to use UserContextProvider first.");
  }

  return ctx.user;
}
