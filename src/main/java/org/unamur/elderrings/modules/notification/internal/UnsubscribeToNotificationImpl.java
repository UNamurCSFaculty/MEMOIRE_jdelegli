package org.unamur.elderrings.modules.notification.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.UnsubscribeToNotificationInterface;
import org.unamur.elderrings.modules.notification.internal.messages.NotificationUserLeftMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
@ApplicationScoped
public class UnsubscribeToNotificationImpl implements UnsubscribeToNotificationInterface {

  private final NotificationSocketManager notificationSocketManager;

  private final ConnectedUser user;

  @Override
  public void unsubscribe(Session session) {
    log.info("Closing notification session for user {}", user.getId());

    notificationSocketManager.closeSession(user.getId(), session);

    boolean hasRemainingSession = notificationSocketManager.hasSession(user.getId());

    if(!hasRemainingSession){
      notificationSocketManager.broadcast(
        NotificationUserLeftMessage.builder()
                                    .type("NOTIFICATION_USER_LEFT")
                                    .value(user.getId())
                                    .build()
      );
    }
  }
  
}
