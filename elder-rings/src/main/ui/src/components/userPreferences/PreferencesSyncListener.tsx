import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { buildWsUrl } from "@utils/webSocketHelper";
import { notificationSocketEventMessage } from "@type/notificationSocketEventMessage";
import { useUserPreferences } from "../../hooks/useUserPreferences";

/**
 * Listens on the shared notification socket and refreshes the local
 * preferences context whenever the backend signals a change (e.g. the
 * staff edited this user's preferences).
 */
export default function PreferencesSyncListener() {
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return null;
}
