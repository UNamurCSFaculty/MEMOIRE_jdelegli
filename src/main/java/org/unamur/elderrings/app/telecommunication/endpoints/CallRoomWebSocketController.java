package org.unamur.elderrings.app.telecommunication.endpoints;

import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.telecommunication.ws.OnCloseCallRoomSession;
import org.unamur.elderrings.app.telecommunication.ws.OnErrorCallRoomSession;
import org.unamur.elderrings.app.telecommunication.ws.OnMessageCallRoomSession;
import org.unamur.elderrings.app.telecommunication.ws.OnOpenCallRoomSession;
import org.unamur.elderrings.modules.user.api.models.User;
import org.unamur.elderrings.utils.JSONEncoder;

import jakarta.enterprise.context.ApplicationScoped;
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
  private final OnErrorCallRoomSession onErrorCallRoomSession;

  @OnOpen
  public void onOpen(User user, Session session, @PathParam("roomId") String roomId){
    onOpenCallRoomSession.onOpen(roomId, session);
  }

  @OnError
  public void onError(User user, Session session, @PathParam("roomId") String roomId){
    onErrorCallRoomSession.onError(roomId);
  }

  @OnClose
  public void onClose(User user, Session session, @PathParam("roomId") String roomId){
    onCloseCallRoomSession.onClose(roomId);
  }

  @OnMessage
  public void onMessage(User user, Session session, String message, @PathParam("roomId") String roomId){
    onMessageCallRoomSession.onMessage(roomId, message);
  }
  
}
