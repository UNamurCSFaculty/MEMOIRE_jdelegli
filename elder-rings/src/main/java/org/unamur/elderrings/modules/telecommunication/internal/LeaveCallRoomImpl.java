package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.telecommunication.api.LeaveCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomUserLeftMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class LeaveCallRoomImpl implements LeaveCallRoomInterface {

  private final CallRoomRepository repository;

  private final SendNotificationInterface sendNotification;

  @Override
  public void leaveCallRoom(CallRoomId id, Session session) {

    var room = repository.findById(id).orElse(null);
    if (room == null) {
      // the room is already gone, there is nothing left to clean up
      return;
    }

    // the identity comes from the socket that is closing, the request context is
    // not reliable on this path
    var member = CallRoomMember.of(session);
    if (member == null) {
      log.warn("Closing a session with no member attached in the call room {}", id.value());
      return;
    }

    // remove the mapping only if it still points to this very session: the late
    // close of a replaced socket must not evict the member's current one
    if (!room.sessions().remove(member, session)) {
      log.info("The session of user {} in the call room {} was already replaced", member.userId(), id.value());
      return;
    }

    // membership is deliberately kept: a closed socket is not a departure, it is
    // also a page reload or a network blip, and membership is what allows the
    // participant to open the socket again. Who is actually in the call is
    // answered by connectedMembers(), which is what the invite right relies on.
    log.info("User {} left the call room {}", member.userId(), room.id().value());

    // the resident daemon listens to this one to put the TV on standby
    sendNotification.send(member.userId(), CallRoomUserLeftMessage.builder()
        .type("CALL_ROOM_USER_LEFT")
        .value(member.userId())
        .build());

    // the remaining participants only tear down that peer, the call goes on
    room.connectedMembers().forEach(peer -> {
      var peerSession = room.sessions().get(peer);
      if (peerSession == null || !peerSession.isOpen()) {
        return;
      }
      try {
        peerSession.getBasicRemote()
            .sendObject(CallRoomUserLeftMessage.builder()
                .type("CALL_ROOM_USER_LEFT")
                .value(member.userId())
                .build());
      } catch (Exception e) {
        log.error("Error while sending user left message in room {}", room.id().value(), e);
      }
    });

    // delete room if no user left
    if (room.connectedMembers().isEmpty()) {
      repository.delete(room.id());
      log.info("Call room {} is empty, deleting it", room.id().value());
    }

  }

}
