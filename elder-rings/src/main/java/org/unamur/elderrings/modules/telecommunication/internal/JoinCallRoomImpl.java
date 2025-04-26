package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.JoinCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomMessageHistoryMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class JoinCallRoomImpl implements JoinCallRoomInterface {

  private final ConnectedUser user;

  private final CallRoomRepository repository;

  @Override
  public void joinCallRoom(CallRoomId id, Session session) {

    var room = repository.findById(id)
                      .orElseThrow(() -> new BadRequestException(String.format("Call room with id %s not found", id.value()))
                      );
    
    if (!room.isMember(user)) {
      throw new ForbiddenException(
        String.format("User %s is not allow to join the call room %s", user.getId(), room.id().value())
      );
    }

    if (room.sessions().containsKey(CallRoomMember.of(user))) {
      throw new BadRequestException(
        String.format("User %s is already connected to the call room %s", user.getId(), room.id().value())
      );
    }

    room.sessions().put(CallRoomMember.of(user), session);
    log.info("User {} joined the call room {}", user.getId(), room.id().value());

    // then send the message history to the user so he can catch up
    try {
      session.getBasicRemote()
              .sendObject(CallRoomMessageHistoryMessage.builder()
                                                        .type("CALL_ROOM_MESSAGE_HISTORY")
                                                        .value(room.messages())
                                                        .build());                          
    } catch (Exception e) {
      log.error("Error while sending message history in room {}, for user {}. Error {}", room.id().value(), user.getId(), e);
    }

  }
  
}
