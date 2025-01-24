package org.unamur.elderrings.modules.notification.internal;

import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.shared.models.SocketMessage;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class SendNotificationImpl implements SendNotificationInterface {

  private final NotificationSocketManager notificationSocketManager;
  
  @Override
  public <T> void send(Set<UUID> userIds, SocketMessage<T> message) {
    userIds.forEach(userId -> {
      notificationSocketManager.send(userId, message);
    });
  }  
  
}
