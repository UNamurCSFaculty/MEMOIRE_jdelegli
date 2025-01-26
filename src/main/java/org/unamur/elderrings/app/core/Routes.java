package org.unamur.elderrings.app.core;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Routes {
  public static final String CALL_ROOM_REST_ENDPOINT = "/call-room";
  public static final String WEBSOCKET_BASE = "/ws";
  public static final String NOTIFICATION_WEBSOCKET_ENDPOINT = WEBSOCKET_BASE + "/notifications";
  public static final String CALL_ROOM_WS_ENDPOINT = WEBSOCKET_BASE + CALL_ROOM_REST_ENDPOINT + "/{roomId}";
}
