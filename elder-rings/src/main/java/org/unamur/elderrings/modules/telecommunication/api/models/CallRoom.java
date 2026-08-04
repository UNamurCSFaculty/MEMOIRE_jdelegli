package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;

import jakarta.validation.constraints.NotNull;
import jakarta.websocket.Session;
import jakarta.ws.rs.BadRequestException;

public record CallRoom(
    @NotNull CallRoomId id,
    @NotNull CallRoomCreationDate creationDate,
    @NotNull Set<CallRoomMember> members,
    @NotNull Map<CallRoomMember, Session> sessions,
    @NotNull Set<CallRoomMember> rejectedBy
){

    public CallRoom {
        if (members.size() < 2) {
            throw new BadRequestException("A CallRoom must have at least 2 members");
        }
    }

    /**
     * Check if the user is a member of the call room
     *
     * @param user
     * @return true if the user is one of the room member, otherwise false
     */
    public boolean isMember(ConnectedUser user) {
        return this.members.contains(CallRoomMember.of(user));
    }

    /**
     * Check if the user is a member of the call room
     *
     * @param userId
     * @return true if the user is one of the room member, otherwise false
     */
    public boolean isMember(UUID userId) {
        return this.members.contains(new CallRoomMember(userId));
    }

    /**
     * The members currently in the call, i.e. holding an open session. Every
     * "who is here" decision must go through this method so that joining,
     * relaying and leaving all agree on the same answer.
     *
     * @return a snapshot of the connected members
     */
    public Set<CallRoomMember> connectedMembers() {
        return this.sessions.entrySet()
            .stream()
            .filter(entry -> entry.getValue().isOpen())
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }

}
