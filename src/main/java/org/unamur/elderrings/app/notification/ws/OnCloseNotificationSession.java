package org.unamur.elderrings.app.notification.ws;

import org.unamur.elderrings.modules.notification.api.UnsubscribeToNotificationInterface;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnCloseNotificationSession {
  
  private final UnsubscribeToNotificationInterface unsubscribeToNotification;

  public void onClose(Session session) {
    unsubscribeToNotification.unsubscribe(session);
  }
  
}
