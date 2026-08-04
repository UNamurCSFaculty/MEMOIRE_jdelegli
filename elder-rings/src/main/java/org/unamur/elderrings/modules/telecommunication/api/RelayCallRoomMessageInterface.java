package org.unamur.elderrings.modules.telecommunication.api;

import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import com.fasterxml.jackson.databind.JsonNode;

public interface RelayCallRoomMessageInterface {

    /**
     * Forwards a WebRTC negotiation payload to a single participant of the room.
     * In a mesh call every peer holds one connection per other peer, so a
     * negotiation payload only makes sense for the peer it was built for.
     *
     * @param roomId       the room both users belong to
     * @param fromUserId   the sender, resolved from the socket it owns
     * @param targetUserId the peer the payload is meant for
     * @param signalType   offer, answer or ice-candidate
     * @param payload      the opaque WebRTC payload, forwarded untouched
     */
    void relaySignal(CallRoomId roomId, UUID fromUserId, UUID targetUserId, String signalType, JsonNode payload);

}
