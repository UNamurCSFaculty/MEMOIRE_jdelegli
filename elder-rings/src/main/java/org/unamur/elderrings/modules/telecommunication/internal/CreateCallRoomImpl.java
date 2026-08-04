package org.unamur.elderrings.modules.telecommunication.internal;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.CreateCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.user.api.models.Family;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.Staff;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserType;
import org.unamur.elderrings.modules.telecommunication.exceptions.DoNotDisturbException;
import org.unamur.elderrings.modules.user.api.GetUser;
import org.unamur.elderrings.modules.user.api.GetUserContacts;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CreateCallRoomImpl implements CreateCallRoomInterface {

  private final ConnectedUser user;
  private final CallRoomRepository repository;
  private final GetUserPreferences getUserPreferences;
  private final GetUser getUser;
  private final GetUserContacts getUserContacts;
  private final CallRoomInvitationSender invitationSender;

  @Override
  public CallRoom createCallRoom(Set<UUID> userIds) {

    checkCanCall(userIds);

    // filter out users with do not disturb enabled, keep preferences for the
    // invitations
    Map<UUID, UserPreferences> prefsByUser = new HashMap<>();
    Set<UUID> reachableUsers = new HashSet<>();
    for (UUID userId : userIds) {
      var prefs = getUserPreferences.getPreferencesForUser(userId);
      prefsByUser.put(userId, prefs);
      if (!prefs.getDnd().isActiveAt(Instant.now())) {
        reachableUsers.add(userId);
      }
    }

    if (reachableUsers.isEmpty()) {
      log.info("All recipients have do not disturb enabled, call room not created");
      throw new DoNotDisturbException();
    }

    Set<CallRoomMember> members = new HashSet<>();
    // add the user in the room members
    members.add(CallRoomMember.of(user));
    // add the other users in the room members
    for (UUID userId : reachableUsers) {
      members.add(new CallRoomMember(userId));
    }

    // create the room
    var room = repository.create(members);
    log.info("Created call room with id {}", room.id().value());

    // notify each user with its own effective call policy
    for (UUID recipientId : reachableUsers) {
      invitationSender.invite(
          room,
          recipientId,
          prefsByUser.get(recipientId),
          user.getId(),
          user.getUserType());
    }

    return room;
  }

  /**
   * Opening a room is what makes somebody a member of it, and membership is
   * what later grants the right to see who else may be invited. It therefore
   * cannot be left to the caller. Everyone may ring their own contacts, a tutor
   * may also reach their relative and the people around them, and the staff may
   * reach any resident and any colleague, which is exactly what the resident and
   * staff directories offer.
   */
  private void checkCanCall(Set<UUID> userIds) {

    Set<UUID> allowed = new HashSet<>();

    getUserContacts.getUserContacts()
        .forEach(contact -> allowed.add(contact.getUser().getId()));

    var self = getUser.getUser(user.getId());
    if (self != null && self.getUser() instanceof Family family
        && family.getTutorOfResidentId() != null) {
      allowed.add(family.getTutorOfResidentId());
      getUserContacts.getContactsForUser(family.getTutorOfResidentId())
          .stream()
          // a family member never reaches the staff, exactly as the list of
          // people they may bring into a call already refuses to show them
          .filter(contact -> !(contact.getUser() instanceof Staff))
          .forEach(contact -> allowed.add(contact.getUser().getId()));
    }

    for (UUID userId : userIds) {
      if (allowed.contains(userId)) {
        continue;
      }
      if (user.getUserType() == UserType.STAFF && isResidentOrStaff(userId)) {
        continue;
      }
      throw new ForbiddenException(
          String.format("User %s is not allowed to call user %s", user.getId(), userId));
    }
  }

  private boolean isResidentOrStaff(UUID userId) {
    var contact = getUser.getUser(userId);
    return contact != null
        && (contact.getUser() instanceof Resident || contact.getUser() instanceof Staff);
  }

}
