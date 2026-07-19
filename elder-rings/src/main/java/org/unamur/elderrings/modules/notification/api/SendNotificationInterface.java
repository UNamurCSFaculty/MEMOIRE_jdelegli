package org.unamur.elderrings.modules.notification.api;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

public interface SendNotificationInterface {

  <T> void send(UUID userId, SocketMessage<T> message);

}
