package org.unamur.elderrings.modules.telecommunication.internal.messages;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

/**
 * Envelope carrying the WebRTC negotiation traffic of one peer to another.
 * Peer traffic has its own message type so that a participant can never forge a
 * room event (a user left, a user joined) towards another participant, and the
 * sender identity is written by the server, not by the sender.
 */
@Getter
@SuperBuilder
public class CallRoomSignalMessage extends SocketMessage<JsonNode> {

  @NotNull
  private UUID from;

  @NotNull
  private String signalType;

}
