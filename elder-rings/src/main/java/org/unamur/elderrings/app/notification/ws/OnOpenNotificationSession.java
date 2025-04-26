package org.unamur.elderrings.app.notification.ws;

import org.unamur.elderrings.modules.notification.api.SubscribeToNotificationInterface;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnOpenNotificationSession {

  private final SubscribeToNotificationInterface subscribeToNotification;

  public void onOpen(Session session) {
    subscribeToNotification.subscribe(session);
  }
  
}
