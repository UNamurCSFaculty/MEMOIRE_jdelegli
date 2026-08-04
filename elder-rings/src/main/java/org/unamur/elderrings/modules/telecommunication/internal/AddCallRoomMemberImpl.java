package org.unamur.elderrings.modules.telecommunication.internal;

import java.time.Instant;
import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.AddCallRoomMemberInterface;
import org.unamur.elderrings.modules.telecommunication.api.GetAddableUsersInterface;
import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.exceptions.DoNotDisturbException;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class AddCallRoomMemberImpl implements AddCallRoomMemberInterface {

    private final ConnectedUser user;
    private final GetCallRoomInterface getCallRoom;
    private final GetAddableUsersInterface getAddableUsers;
    private final GetUserPreferences getUserPreferences;
    private final CallRoomInvitationSender invitationSender;

    @Override
    public void addMember(CallRoomId roomId, UUID userId) {

        // the addable list is the single place where the rule lives, and it already
        // checks that the caller is a member allowed to invite
        var allowed = getAddableUsers.getAddableUsers(roomId).all()
                .anyMatch(contact -> contact.getUser().getId().equals(userId));

        if (!allowed) {
            throw new ForbiddenException(
                    String.format("User %s cannot be added to the call room %s", userId, roomId.value()));
        }

        var room = getCallRoom.getCallRoom(roomId);

        var preferences = getUserPreferences.getPreferencesForUser(userId);
        if (preferences.getDnd().isActiveAt(Instant.now())) {
            throw new DoNotDisturbException();
        }

        // adding is the decision point: the set answers false when the member is
        // already there, so a double click cannot ring the invitee twice
        if (!room.members().add(new CallRoomMember(userId))) {
            log.info("User {} is already in the call room {}", userId, roomId.value());
            return;
        }

        log.info("User {} invited user {} into the call room {}", user.getId(), userId, roomId.value());

        invitationSender.invite(room, userId, preferences, user.getId(), user.getUserType());
    }

}