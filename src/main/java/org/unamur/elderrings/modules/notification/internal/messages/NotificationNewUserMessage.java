package org.unamur.elderrings.modules.notification.internal.messages;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import lombok.experimental.SuperBuilder;

@SuperBuilder
public class NotificationNewUserMessage extends SocketMessage<UUID> {
  
}
