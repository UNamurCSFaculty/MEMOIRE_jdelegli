package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.JoinCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomParticipantsMessage;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomUserJoinedMessage;

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
        .orElseThrow(() -> new BadRequestException(String.format("Call room with id %s not found", id.value())));

    if (!room.isMember(user)) {
      throw new ForbiddenException(
          String.format("User %s is not allow to join the call room %s", user.getId(), room.id().value()));
    }

    var member = CallRoomMember.of(user);

    // the peers already in the call, captured before we add ourselves
    var alreadyHere = room.connectedMembers()
        .stream()
        .filter(peer -> !peer.equals(member))
        .toList();

    // checking and inserting in one atomic step: a session left behind by a
    // dropped connection is replaced, a live one means a genuine double join
    room.sessions().compute(member, (key, existing) -> {
      if (existing != null && existing.isOpen()) {
        throw new BadRequestException(
            String.format("User %s is already connected to the call room %s", user.getId(), id.value()));
      }
      return session;
    });

    log.info("User {} joined the call room {}", user.getId(), room.id().value());

    // tell the newcomer who is already in the call
    sendTo(session, CallRoomParticipantsMessage.builder()
        .type("CALL_ROOM_PARTICIPANTS")
        .value(alreadyHere.stream().map(CallRoomMember::userId).toList())
        .build());

    // then tell the others that someone joined
    alreadyHere.forEach(peer -> sendTo(room.sessions().get(peer),
        CallRoomUserJoinedMessage.builder()
            .type("CALL_ROOM_USER_JOINED")
            .value(user.getId())
            .build()));

  }

  private void sendTo(Session session, Object message) {
    if (session == null || !session.isOpen()) {
      return;
    }
    try {
      session.getBasicRemote().sendObject(message);
    } catch (Exception e) {
      log.error("Error while sending a {} in a call room", message.getClass().getSimpleName(), e);
    }
  }

}
