package org.unamur.elderrings.modules.notification.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.SubscribeToNotificationInterface;
import org.unamur.elderrings.modules.notification.internal.messages.NotificationConnectedUsernameList;
import org.unamur.elderrings.modules.notification.internal.messages.NotificationNewUserMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class SubscribeToNotificationImpl implements SubscribeToNotificationInterface {

  private final NotificationSocketManager notificationSocketManager;

  private final ConnectedUser user;
  
  @Override
  public void subscribe(Session session) {
    log.info("Startiong notification session for user {}", user.getId());

    boolean alreadyHaveSession = notificationSocketManager.hasSession(user.getId());

    notificationSocketManager.startSession(user.getId(), session);

    notificationSocketManager.send(user.getId(), NotificationConnectedUsernameList.builder()
                                                                                  .type("NOTIFICATION_CONNECTED_USER_LIST")
                                                                                  .value(notificationSocketManager.getSubscribedUsers())
                                                                                  .build());

    if(!alreadyHaveSession){
      notificationSocketManager.broadcast(
        NotificationNewUserMessage.builder()
                                  .type("NOTIFICATION_NEW_USER_CONNECTED")
                                  .value(user.getId())
                                  .build(),
        user.getId()
      ); 
    }

  }
  
  
}
