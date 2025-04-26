package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.RejectCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomRejectionMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class RejectCallRoomImpl implements RejectCallRoomInterface {

  private final ConnectedUser user;

  private final CallRoomRepository repository;

  @Override
  public void markRejectedBy(CallRoomId id) {

    var room = repository.findById(id)
                      .orElseThrow(() -> new BadRequestException(String.format("Call room with id %s not found", id.value()))
                      );
    
    if (!room.isMember(user)) {
      throw new ForbiddenException(
        String.format("User %s cannot reject the call room %s as he is not a member", user.getId(), room.id().value())
      );
    }

    if (room.sessions().containsKey(CallRoomMember.of(user))) {
      throw new BadRequestException(
        String.format("User %s already joined the call room %s, he cannot reject the request", user.getId(), room.id().value())
      );
    }

    repository.markRejectedBy(room.id(), CallRoomMember.of(user));

    room.sessions().remove(CallRoomMember.of(user));
    log.info("User {} refused to join the call room {}", user.getId(), room.id().value());


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
                  .sendObject(CallRoomRejectionMessage.builder()
                                                            .type("CALL_ROOM_USER_REJECTED_CALL")
                                                            .value(user.getId())
                                                            .build());                          
        } catch (Exception e) {
          log.error("Error while sending user rejection message in room {}. Error {}", room.id().value(), e);
        }
      }
    );
  }
  
}
