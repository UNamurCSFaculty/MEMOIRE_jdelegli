package org.unamur.elderrings.modules.telecommunication.internal.messages;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import lombok.Builder;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
public class CallRoomInvitationMessage extends SocketMessage<CallRoomInvitationMessage.CallRoomInvitationMessageValue> {

    @Getter
    @Builder
    public static final class CallRoomInvitationMessageValue {

        private UUID roomId;
        private UUID userId;

    }
    
}
