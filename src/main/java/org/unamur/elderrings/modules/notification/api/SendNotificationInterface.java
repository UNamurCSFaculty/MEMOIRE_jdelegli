package org.unamur.elderrings.modules.notification.api;

import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

public interface SendNotificationInterface {
  
  <T> void send(Set<UUID> userIds, SocketMessage<T> message);

}
