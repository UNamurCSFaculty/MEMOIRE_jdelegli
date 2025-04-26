package org.unamur.elderrings.modules.notification.api;

import jakarta.websocket.Session;

public interface UnsubscribeToNotificationInterface {
  
  void unsubscribe(Session session);

}
