package org.unamur.elderrings.infra.notifications;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.app.shared.managers.SocketManager;
import org.unamur.elderrings.modules.notification.internal.NotificationSocketManager;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class NotificationSocketManagerImpl extends SocketManager<UUID> implements NotificationSocketManager {

  @Override
  public boolean hasSession(UUID userId) {
    return super.hasSession(userId);
  }

  @Override
  public void startSession(UUID userId, Session session) {
    super.startSession(userId, session);
  }

  @Override
  public void closeSession(UUID userId, Session session) {
    super.closeSession(userId, session);
  }

  @Override
  public void broadcast(Object message) {
    super.broadcast(message);
  }

  @Override
  public void broadcast(Object message, UUID exclude) {
    super.broadcast(message, exclude);
  }


  @Override
  public void send(UUID userId, Object message) {
    super.send(userId, message);
  }

  @Override
  public List<UUID> getSubscribedUsers() {
    return super.getSubscribedUsers();
  }
  
}
