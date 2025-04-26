import { UserAuthContext } from "@contexts/contexts";
import NotConnectedPage from "@pages/generic/NotConnectedPage";
import { ReactNode, useContext } from "react";

interface AuthGatewayProps {
  children: ReactNode;
}

export default function AuthGateway({ children }: Readonly<AuthGatewayProps>) {
  const ctx = useContext(UserAuthContext);

  if (ctx.user === null) {
    return <NotConnectedPage />;
  } else {
    return children;
  }
}
