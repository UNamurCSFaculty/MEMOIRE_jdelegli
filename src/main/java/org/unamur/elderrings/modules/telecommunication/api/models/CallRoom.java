package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.Set;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;

import java.util.List;
import java.util.Map;
import jakarta.validation.constraints.NotNull;
import jakarta.websocket.Session;
import jakarta.ws.rs.BadRequestException;

public record CallRoom(
    @NotNull CallRoomId id,
    @NotNull CallRoomCreationDate creationDate,
    @NotNull Set<CallRoomMember> members,
    @NotNull Map<CallRoomMember, Session> sessions,
    @NotNull List<String> messages,
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
        return this.members.stream().anyMatch(member -> member.equals(CallRoomMember.of(user)));
    }

}
