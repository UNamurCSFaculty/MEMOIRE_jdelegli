package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.LeaveCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomUserLeftMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class LeaveCallRoomImpl implements LeaveCallRoomInterface {

  private final ConnectedUser user;

  private final CallRoomRepository repository;
  
  @Override
  public void leaveCallRoom(CallRoomId id) {

    var room = repository.findById(id)
                      .orElseThrow(() -> new BadRequestException(String.format("Call room with id %s not found", id.value()))
                      );
    
    if (!room.isMember(user)) {
      throw new ForbiddenException(
        String.format("User %s cannot leave the call room %s as he is not a member", user.getId(), room.id().value())
      );
    }

    if (!room.sessions().containsKey(CallRoomMember.of(user))) {
      throw new BadRequestException(
        String.format("User %s is not connected to the call room %s, he cannot leave it", user.getId(), room.id().value())
      );
    }

    room.sessions().remove(CallRoomMember.of(user));
    log.info("User {} left the call room {}", user.getId(), room.id().value());

    // delete room if no user left
    if(room.sessions().isEmpty()) {
      repository.delete( room.id());
      log.info("Call room {} is empty, deleting it",  room.id());
    }

    // notify all users that the user left
    room.sessions().values().forEach(session ->
      {
        try {
          session.getBasicRemote()
                  .sendObject(CallRoomUserLeftMessage.builder()
                                                            .type("CALL_ROOM_USER_LEFT")
                                                            .value(user.getId())
                                                            .build());                          
        } catch (Exception e) {
          log.error("Error while sending user left message in room {}. Error {}", room.id().value(), e);
        }
      }
    );

  }
  
}
