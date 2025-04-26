package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.telecommunication.api.CreateCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomInvitationMessage;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CreateCallRoomImpl implements CreateCallRoomInterface {

  private final ConnectedUser user;
  
  private final CallRoomRepository repository;

  private final SendNotificationInterface sendNotification;
  
  @Override
  public CallRoom createCallRoom(Set<UUID> userIds) {

    Set<CallRoomMember> members = new HashSet<>();
    //add the user in the room members
    members.add(CallRoomMember.of(user));
    //add the other users in the room members
    for(UUID userId : userIds) {
      members.add(new CallRoomMember(userId));
    }
    
    //create the room
    var room = repository.create(members);
    log.info("Created call room with id {}", room.id().value());

    // notify all users
    sendNotification.send(
      userIds,
      CallRoomInvitationMessage.builder()
                                .type("CALL_ROOM_INVITATION")
                                .value(CallRoomInvitationMessage.CallRoomInvitationMessageValue.builder()
                                                                                                  .roomId(room.id().value())
                                                                                                  .userId(user.getId())
                                                                                                  .build())
                                .build()
    );


    return room;
  }
  
}
