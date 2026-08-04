import { useContext, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { buildWsUrl } from "@utils/webSocketHelper";
import { notificationSocketEventMessage } from "@type/notificationSocketEventMessage";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { UserAuthContext } from "@contexts/contexts";

/**
 * Listens on the shared notification socket and refreshes the local
 * preferences and user context whenever the backend signals a change (e.g. the
 * staff edited this user's preferences or user's autonomy level).
 */
export default function PreferencesSyncListener() {
  const ctx = useContext(UserAuthContext);
  const { refreshUserPreferences } = useUserPreferences();
  const { lastJsonMessage } = useWebSocket(buildWsUrl("notifications"), {
    share: true,
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    reconnectAttempts: Infinity,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      const parsed = notificationSocketEventMessage.parse(lastJsonMessage);
      if (parsed.type === "PREFERENCES_UPDATED") {
        refreshUserPreferences();
      } else if (parsed.type === "USER_UPDATED") {
        ctx?.refreshUser?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return null;
}
