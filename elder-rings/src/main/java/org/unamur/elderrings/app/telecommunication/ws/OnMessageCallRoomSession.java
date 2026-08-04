package org.unamur.elderrings.app.telecommunication.ws;

import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.RelayCallRoomMessageInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnMessageCallRoomSession {

  /**
   * Only the WebRTC negotiation traffic may travel from one participant to
   * another: anything else would let a member forge a room event at a peer.
   */
  private static final Set<String> SIGNAL_TYPES = Set.of("offer", "answer", "ice-candidate");

  private final ObjectMapper objectMapper;
  private final RelayCallRoomMessageInterface relayCallRoomMessage;

  public void onMessage(String roomId, String message, Session session){

    // being attached to the socket is the proof of membership, it was checked
    // when the session was opened
    var sender = CallRoomMember.of(session);
    if (sender == null) {
      log.warn("Ignoring a message from a session with no member attached in the call room {}", roomId);
      return;
    }

    ObjectNode incoming;
    try {
      incoming = (ObjectNode) objectMapper.readTree(message);
    } catch (Exception e) {
      log.warn("Ignoring a malformed message from user {} in the call room {}", sender.userId(), roomId);
      return;
    }

    var signalType = incoming.path("type").asText(null);
    if (!SIGNAL_TYPES.contains(signalType)) {
      log.warn("Ignoring a message of type {} from user {} in the call room {}", signalType, sender.userId(), roomId);
      return;
    }

    UUID target;
    try {
      target = UUID.fromString(incoming.path("to").asText());
    } catch (IllegalArgumentException e) {
      log.warn("Ignoring a {} with no valid target from user {} in the call room {}", signalType, sender.userId(),
          roomId);
      return;
    }

    if (target.equals(sender.userId())) {
      log.warn("Ignoring a {} that user {} addressed to itself", signalType, sender.userId());
      return;
    }

    relayCallRoomMessage.relaySignal(CallRoomId.fromString(roomId), sender.userId(), target, signalType,
        incoming.get("value"));
  }

}
