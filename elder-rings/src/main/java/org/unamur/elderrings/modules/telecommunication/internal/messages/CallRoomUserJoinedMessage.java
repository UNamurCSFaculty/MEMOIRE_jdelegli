package org.unamur.elderrings.modules.telecommunication.internal.messages;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import lombok.experimental.SuperBuilder;

/**
 * Sent to the members already in the call when someone joins.
 */
@SuperBuilder
public class CallRoomUserJoinedMessage extends SocketMessage<UUID> {

}
