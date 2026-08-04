package org.unamur.elderrings.modules.telecommunication.internal.messages;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import lombok.experimental.SuperBuilder;

/**
 * Sent to a member that just joined: the users already in the call.
 */
@SuperBuilder
public class CallRoomParticipantsMessage extends SocketMessage<List<UUID>> {

}
