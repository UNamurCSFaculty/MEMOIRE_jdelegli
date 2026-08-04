package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.RelayCallRoomMessageInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomSignalMessage;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class RelayCallRoomMessageImpl implements RelayCallRoomMessageInterface {

    private final CallRoomRepository repository;

    @Override
    public void relaySignal(CallRoomId roomId, UUID fromUserId, UUID targetUserId, String signalType,
            JsonNode payload) {

        var room = repository.findById(roomId)
                .orElseThrow(() -> new BadRequestException(
                        String.format("Call room with id %s not found", roomId.value())));

        if (!room.isMember(targetUserId)) {
            throw new ForbiddenException(
                    String.format("User %s is not a member of the call room %s", targetUserId, roomId.value()));
        }

        var targetSession = room.sessions().get(new CallRoomMember(targetUserId));

        if (targetSession == null || !targetSession.isOpen()) {
            // the peer left between the moment the payload was built and now
            log.warn("Dropping a {} for user {}: no open session in the call room {}", signalType, targetUserId,
                    roomId.value());
            return;
        }

        try {
            targetSession.getBasicRemote()
                    .sendObject(CallRoomSignalMessage.builder()
                            .type("SIGNAL")
                            .from(fromUserId)
                            .signalType(signalType)
                            .value(payload)
                            .build());
        } catch (Exception e) {
            log.error("Failed to relay a {} to user {} in the call room {}", signalType, targetUserId,
                    roomId.value(), e);
        }
    }

}
