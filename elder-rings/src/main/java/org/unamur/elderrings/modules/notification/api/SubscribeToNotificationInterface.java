package org.unamur.elderrings.modules.notification.api;

import jakarta.websocket.Session;

public interface SubscribeToNotificationInterface {
  
  void subscribe(Session session);

}
