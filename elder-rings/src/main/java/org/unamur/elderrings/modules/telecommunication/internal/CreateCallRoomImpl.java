package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.telecommunication.api.CreateCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserType;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomInvitationMessage;
import org.unamur.elderrings.modules.telecommunication.exceptions.DoNotDisturbException;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CreateCallRoomImpl implements CreateCallRoomInterface {

  private final ConnectedUser user;
  private final CallRoomRepository repository;
  private final SendNotificationInterface sendNotification;
  private final GetUserPreferences getUserPreferences;

  @Override
  public CallRoom createCallRoom(Set<UUID> userIds) {

    //filter out users with do not disturb enabled, keep preferences for the invitations
    Map<UUID, UserPreferences> prefsByUser = new HashMap<>();
    Set<UUID> reachableUsers = new HashSet<>();
    for (UUID userId: userIds) {
      var prefs = getUserPreferences.getPreferencesForUser(userId);
      prefsByUser.put(userId, prefs);
      if (!prefs.getGeneral().isDoNotDisturb()) {
        reachableUsers.add(userId);
      }
    }

    if (reachableUsers.isEmpty()) {
      log.info("All recipients have do not disturb enabled, call room not created");
      throw new DoNotDisturbException();
    }

    Set<CallRoomMember> members = new HashSet<>();
    //add the user in the room members
    members.add(CallRoomMember.of(user));
    //add the other users in the room members
    for(UUID userId : reachableUsers) {
      members.add(new CallRoomMember(userId));
    }
    
    //create the room
    var room = repository.create(members);
    log.info("Created call room with id {}", room.id().value());

    // notify each user with its own effective call policy
    for (UUID recipientId : reachableUsers) {
      // a null call policy section means the recipient is not a resident
      var policy = prefsByUser.get(recipientId).getCallPolicy();
      Boolean autoAnswer = null;
      Boolean cameraOn = null;

      if (policy != null) {
        autoAnswer = policy.isAutoAnswer();
        cameraOn = policy.isCameraOnByDefault() && user.getUserType() != UserType.STAFF; // Call initiated by a staff member, camera should be off by default (ethical reason)
      }

      sendNotification.send(
        recipientId,
        CallRoomInvitationMessage.builder()
          .type("CALL_ROOM_INVITATION")
          .value(CallRoomInvitationMessage.CallRoomInvitationMessageValue.builder()
                  .roomId(room.id().value())
                  .userId(user.getId())
                  .autoAnswer(autoAnswer)
                  .cameraOn(cameraOn)
                  .build())
          .build()
      );
    }

    return room;
  }
  
}
