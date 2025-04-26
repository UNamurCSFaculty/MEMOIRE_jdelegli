package org.unamur.elderrings.modules.notification.internal;

import java.util.List;
import java.util.UUID;

import jakarta.websocket.Session;

public interface NotificationSocketManager {

  boolean hasSession(UUID userId);

  void startSession(UUID userId, Session session);

  void closeSession(UUID userId, Session session);

  void broadcast(Object message);

  void broadcast(Object message, UUID exclude);

  void send(UUID userId, Object message);
  
  List<UUID> getSubscribedUsers();
  
}
