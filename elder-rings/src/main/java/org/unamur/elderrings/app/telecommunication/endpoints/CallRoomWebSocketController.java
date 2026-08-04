package org.unamur.elderrings.app.telecommunication.endpoints;

import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.telecommunication.ws.OnCloseCallRoomSession;
import org.unamur.elderrings.app.telecommunication.ws.OnMessageCallRoomSession;
import org.unamur.elderrings.app.telecommunication.ws.OnOpenCallRoomSession;
import org.unamur.elderrings.utils.JSONEncoder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.CloseReason;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
@ServerEndpoint(value = Routes.CALL_ROOM_WS_ENDPOINT, encoders = JSONEncoder.class)
public class CallRoomWebSocketController {

  private final OnOpenCallRoomSession onOpenCallRoomSession;
  private final OnCloseCallRoomSession onCloseCallRoomSession;
  private final OnMessageCallRoomSession onMessageCallRoomSession;

  @OnOpen
  public void onOpen(Session session, @PathParam("roomId") String roomId){
    onOpenCallRoomSession.onOpen(roomId, session);
  }

  @OnError
  public void onError(Session session, Throwable throwable, @PathParam("roomId") String roomId){
    log.error("WebSocket error in room {}: {}", roomId, throwable.getMessage());
  }

  @OnClose
  public void onClose(Session session, CloseReason closeReason, @PathParam("roomId") String roomId){
    log.info("WebSocket closed for room {} - code: {}, reason: {}", roomId, closeReason.getCloseCode(), closeReason.getReasonPhrase());
    onCloseCallRoomSession.onClose(roomId, session);
  }

  @OnMessage
  public void onMessage(Session session, String message, @PathParam("roomId") String roomId){
    onMessageCallRoomSession.onMessage(roomId, message, session);
  }
  
}
