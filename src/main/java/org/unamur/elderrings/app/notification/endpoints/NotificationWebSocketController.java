package org.unamur.elderrings.app.notification.endpoints;

import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.notification.ws.OnCloseNotificationSession;
import org.unamur.elderrings.app.notification.ws.OnErrorNotificationSession;
import org.unamur.elderrings.app.notification.ws.OnOpenNotificationSession;
import org.unamur.elderrings.utils.JSONEncoder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
@ServerEndpoint(value= Routes.NOTIFICATION_WEBSOCKET_ENDPOINT, encoders = {JSONEncoder.class})
public class NotificationWebSocketController {

  private final OnCloseNotificationSession onCloseNotificationSession;
  private final OnErrorNotificationSession onErrorNotificationSession;
  private final OnOpenNotificationSession onOpenNotificationSession;

  @OnClose
  public void onClose(Session session) {
    onCloseNotificationSession.onClose(session);
  }

  @OnOpen
  public void onOpen(Session session) {
    onOpenNotificationSession.onOpen(session);
  }

  @OnError
  public void onError(Session session, Throwable throwable) {
    onErrorNotificationSession.onError(session);
  }
  
}
